import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transactionService } from '../../services/business-central/transaction.service';
import * as client from '../../services/business-central/client';


global.fetch = vi.fn();

vi.mock('../../config/env', () => ({
  env: {
    ENTRA_CLIENT_ID: 'mock-client-id',
    ENTRA_CLIENT_SECRET: 'mock-secret',
    ENTRA_TENANT_ID: 'mock-tenant',
    BC_COMPANY_ID: 'mock-company',
    BC_API_URL: 'https://api.businesscentral.dynamics.com',
  }
}));

vi.mock('../../services/business-central/client', () => ({
  bcFetch: vi.fn(),
}));

describe('TransactionService', () => {
  const mockOwnerOid = 'test-owner-oid-123';
  const mockSystemId = 'sys-id-456';
  
  beforeEach(() => {
    vi.resetAllMocks();
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'mock-token' })
    });
  });

  describe('DTO mapping', () => {
    it('should correctly map BCTransactionResponseDTO to Transaction domain model including ETag', async () => {
      const mockDto = {
        '@odata.etag': 'W/"etag123"',
        systemId: mockSystemId,
        entryNo: 1,
        ownerEntraObjectId: mockOwnerOid,
        transactionDate: '2026-07-07',
        transactionType: 'Income',
        description: 'Test',
        categoryCode: 'CAT',
        subcategoryCode: '',
        accountCode: '',
        amount: 100,
        currencyCode: '',
        paymentMethodCode: '',
        reference: '',
        notes: '',
        tags: '',
        systemCreatedAt: '2026-07-07T00:00:00Z',
        systemModifiedAt: '2026-07-07T00:00:00Z'
      };

      vi.mocked(client.bcFetch).mockResolvedValueOnce(mockDto);
      const result = await transactionService.getTransaction(mockOwnerOid, mockSystemId);
      
      expect(result).not.toBeNull();
      expect(result?.etag).toBe('W/"etag123"');
      expect(result?.ownerEntraObjectId).toBe(mockOwnerOid);
    });

    it('@odata.nextLink continuation is handled correctly', async () => {
      vi.mocked(client.bcFetch).mockResolvedValueOnce({
        value: [],
        '@odata.nextLink': 'https://api.businesscentral.dynamics.com/next'
      });
      const result = await transactionService.getTransactions(mockOwnerOid, { nextLink: 'https://api.businesscentral.dynamics.com/next' });
      expect(client.bcFetch).toHaveBeenCalledWith('https://api.businesscentral.dynamics.com/next');
      expect(result.nextLink).toBe('https://api.businesscentral.dynamics.com/next');
    });
  });

  describe('owner filter enforcement & OData URL generation', () => {
    it('should automatically apply ownerEntraObjectId filter to collection reads', async () => {
      vi.mocked(client.bcFetch).mockResolvedValueOnce({ value: [] });
      await transactionService.getTransactions(mockOwnerOid, { top: 10, skip: 0 });
      
      const fetchCall = vi.mocked(client.bcFetch).mock.calls[0];
      const url = fetchCall[0] as string;
      const decodedUrl = decodeURIComponent(url.replace(/\+/g, ' '));
      expect(decodedUrl).toContain(`$filter=ownerEntraObjectId eq '${mockOwnerOid}'`);
      expect(decodedUrl).toContain('$top=10');
      expect(decodedUrl).toContain('$skip=0');
    });

    it('OData string values are escaped safely', async () => {
      vi.mocked(client.bcFetch).mockResolvedValueOnce({ value: [] });
      await transactionService.getTransactions(mockOwnerOid, { filter: "description eq 'test'" });
      const fetchCall = vi.mocked(client.bcFetch).mock.calls[0];
      const decodedUrl = decodeURIComponent((fetchCall[0] as string).replace(/\+/g, ' '));
      expect(decodedUrl).toContain(`and (description eq 'test')`);
      expect(decodedUrl).toContain(`ownerEntraObjectId eq '${mockOwnerOid}'`);
    });
  });

  describe('create owner injection', () => {
    it('should inject ownerEntraObjectId during create and omit it from input DTO requirements', async () => {
      vi.mocked(client.bcFetch).mockResolvedValueOnce({
        '@odata.etag': 'W/"new"',
        systemId: 'new-id',
        ownerEntraObjectId: mockOwnerOid,
      });

      await transactionService.createTransaction(mockOwnerOid, {
        transactionDate: '2026-07-07',
        transactionType: 'Income',
        description: 'Test Create',
        categoryId: 'cat-id',
        categoryCode: 'CAT',
        accountId: 'acc-id',
        accountCode: 'ACC',
        amount: 50
      });

      const fetchCall = vi.mocked(client.bcFetch).mock.calls[0];
      const requestOptions = fetchCall[1] as RequestInit;
      const body = JSON.parse(requestOptions.body as string);
      
      expect(body.ownerEntraObjectId).toBe(mockOwnerOid);
    });

    it('Client-supplied ownership cannot override trusted oid', async () => {
      vi.mocked(client.bcFetch).mockResolvedValueOnce({
        '@odata.etag': 'W/"new"',
        systemId: 'new-id',
        ownerEntraObjectId: mockOwnerOid,
      });

      // even if casted to try to bypass TS
      const maliciousPayload = {
        transactionDate: '2026-07-07',
        transactionType: 'Income',
        description: 'Test Create',
        categoryId: 'cat-id',
        categoryCode: 'CAT',
        accountId: 'acc-id',
        accountCode: 'ACC',
        amount: 50,
        ownerEntraObjectId: 'malicious-id'
      };
      
      await transactionService.createTransaction(
        mockOwnerOid, 
        maliciousPayload as unknown as import('../../types/transaction.types').BCTransactionCreateDTO
      );

      const fetchCall = vi.mocked(client.bcFetch).mock.calls[0];
      const body = JSON.parse((fetchCall[1] as RequestInit).body as string);
      expect(body.ownerEntraObjectId).toBe(mockOwnerOid);
    });
  });

  describe('update DTO ownership exclusion and ETag', () => {
    it('should enforce If-Match header and verify ownership before update', async () => {
      // Mock getTransaction to pass ownership check
      vi.mocked(client.bcFetch).mockResolvedValueOnce({
        '@odata.etag': 'W/"old"',
        systemId: mockSystemId,
        ownerEntraObjectId: mockOwnerOid, 
      });
      // Mock PATCH response
      vi.mocked(client.bcFetch).mockResolvedValueOnce({
        '@odata.etag': 'W/"new"',
        systemId: mockSystemId,
        ownerEntraObjectId: mockOwnerOid,
      });

      const etag = 'W/"old"';
      await transactionService.updateTransaction(mockOwnerOid, mockSystemId, etag, {
        amount: 200
      });

      const patchCall = vi.mocked(client.bcFetch).mock.calls[1];
      expect(patchCall[0]).toContain(mockSystemId);
      const options = patchCall[1] as RequestInit;
      expect(options.method).toBe('PATCH');
      
      const headers = new Headers(options.headers);
      expect(headers.get('If-Match')).toBe(etag);
      
      const body = JSON.parse(options.body as string);
      expect(body.ownerEntraObjectId).toBeUndefined();
    });

    it('should throw Forbidden if trying to update a transaction owned by another user', async () => {
      vi.mocked(client.bcFetch).mockResolvedValueOnce({
        '@odata.etag': 'W/"old"',
        systemId: mockSystemId,
        ownerEntraObjectId: 'different-owner',
      });

      const promise = transactionService.updateTransaction(mockOwnerOid, mockSystemId, 'W/"old"', {
        amount: 200
      });
      
      await expect(promise).rejects.toThrow('Forbidden');
    });
  });

  describe('BC error mapping', () => {
    it('should handle 404 for getTransaction gracefully by returning null', async () => {
      const notFoundError = new Error('Not Found') as Error & { statusCode?: number };
      notFoundError.statusCode = 404;
      vi.mocked(client.bcFetch).mockRejectedValueOnce(notFoundError);
      
      const result = await transactionService.getTransaction(mockOwnerOid, mockSystemId);
      expect(result).toBeNull();
    });

    it('HTTP 412 maps to ConcurrencyConflictError (bubbled up from bcFetch)', async () => {
      const conflictError = new Error('ConcurrencyConflictError') as Error & { statusCode?: number, name?: string };
      conflictError.statusCode = 412;
      conflictError.name = 'ConcurrencyConflictError';
      vi.mocked(client.bcFetch).mockResolvedValueOnce({ systemId: mockSystemId, ownerEntraObjectId: mockOwnerOid }); // getTransaction mock
      vi.mocked(client.bcFetch).mockRejectedValueOnce(conflictError); // updateTransaction mock
      
      const promise = transactionService.updateTransaction(mockOwnerOid, mockSystemId, 'W/"old"', { amount: 200 });
      await expect(promise).rejects.toThrow('ConcurrencyConflictError');
    });

    it('204 No Content is handled correctly during delete', async () => {
      vi.mocked(client.bcFetch).mockResolvedValueOnce({ systemId: mockSystemId, ownerEntraObjectId: mockOwnerOid }); // getTransaction mock
      vi.mocked(client.bcFetch).mockResolvedValueOnce(null); // bcFetch delete returns null for 204
      
      await expect(transactionService.deleteTransaction(mockOwnerOid, mockSystemId, 'W/"old"')).resolves.toBeUndefined();
    });
  });
});
