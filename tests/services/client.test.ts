import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bcFetch } from '../../services/business-central/client';

global.fetch = vi.fn();

vi.mock('../../config/env', () => ({
  env: {
    ENTRA_CLIENT_ID: 'mock-client-id',
    ENTRA_CLIENT_SECRET: 'mock-secret',
    ENTRA_TENANT_ID: 'mock-tenant',
    BC_API_URL: 'https://api.businesscentral.dynamics.com',
  }
}));

describe('BC Client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('HTTP 412 maps to ConcurrencyConflictError', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(async (url) => {
      if (url.toString().includes('token')) {
        return { ok: true, json: async () => ({ access_token: 'mock-token', expires_in: 3600 }) };
      }
      return { ok: false, status: 412, json: async () => ({ error: { message: 'Precondition Failed' } }) };
    });

    await expect(bcFetch('/test')).rejects.toThrow('ConcurrencyConflictError');
  });

  it('HTTP 404 maps to NotFoundError', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(async (url) => {
      if (url.toString().includes('token')) {
        return { ok: true, json: async () => ({ access_token: 'mock-token', expires_in: 3600 }) };
      }
      return { ok: false, status: 404, json: async () => ({ error: { message: 'Not Found' } }) };
    });

    await expect(bcFetch('/test')).rejects.toThrow('NotFoundError');
  });
});
