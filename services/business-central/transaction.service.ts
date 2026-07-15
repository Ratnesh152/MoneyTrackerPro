import { env } from '@/config/env';
import { bcFetch } from './client';
import { 
  BCTransactionCreateDTO, 
  BCTransactionUpdateDTO, 
  BCTransactionResponseDTO, 
  Transaction 
} from '@/types/transaction.types';
import { getAccounts } from './account.service';
import { getCategories } from './category.service';
import { Account } from '@/types/account.types';
import { Category } from '@/types/category.types';

export interface GetTransactionsOptions {
  top?: number;
  skip?: number;
  filter?: string;
  orderBy?: string;
  nextLink?: string;
}

export interface PaginatedTransactions {
  value: Transaction[];
  nextLink?: string;
}

const API_PATH = `/api/alletec/moneyTracker/v1.0/companies(${env.BC_COMPANY_ID})/transactions`;

export class TransactionService {

  private mapToDomain(
    dto: BCTransactionResponseDTO,
    accountMap?: Map<string, Account>,
    categoryMap?: Map<string, Category>
  ): Transaction {
    // BC returns GUIDs wrapped in curly braces {xxxxxxxx-...}; strip them
    const cleanId = (id: string) => (id || '').replace(/[{}]/g, '').toLowerCase();

    const cleanAccountId = cleanId(dto.accountId);
    const cleanCategoryId = cleanId(dto.categoryId);

    const account = accountMap?.get(cleanAccountId);
    const category = categoryMap?.get(cleanCategoryId);

    return {
      etag: dto['@odata.etag'],
      systemId: cleanId(dto.systemId),
      entryNo: dto.entryNo,
      ownerEntraObjectId: cleanId(dto.ownerEntraObjectId),
      transactionDate: dto.transactionDate,
      transactionType: dto.transactionType,
      description: dto.description,
      categoryId: cleanCategoryId,
      categoryCode: dto.categoryCode,
      categoryName: category?.name || dto.categoryCode,
      subcategoryCode: dto.subcategoryCode,
      accountId: cleanAccountId,
      accountCode: dto.accountCode,
      accountName: account?.name || dto.accountCode,
      amount: dto.amount,
      currencyCode: dto.currencyCode,
      paymentMethodCode: dto.paymentMethodCode,
      reference: dto.reference,
      notes: dto.notes,
      tags: dto.tags,
      systemCreatedAt: dto.systemCreatedAt,
      systemModifiedAt: dto.systemModifiedAt,
    };
  }

  private async loadDictionaries(ownerOid: string) {
    // Load accounts and categories concurrently
    const [accounts, categories] = await Promise.all([
      getAccounts(ownerOid, { top: 1000 }),
      getCategories(ownerOid, { top: 1000 })
    ]);

    const accountMap = new Map<string, Account>(
      accounts.value.map(a => [a.systemId, a])
    );
    
    const categoryMap = new Map<string, Category>(
      categories.value.map(c => [c.systemId, c])
    );

    return { accountMap, categoryMap };
  }

  async getTransactions(ownerOid: string, options?: GetTransactionsOptions): Promise<PaginatedTransactions> {
    if (options?.nextLink) {
      const data = await bcFetch(options.nextLink);
      return {
        value: (data.value || []).map((v: BCTransactionResponseDTO) => this.mapToDomain(v)),
        nextLink: data['@odata.nextLink'],
      };
    }

    // Build OData query string manually — ownerEntraObjectId is NOT filterable in BC.
    // Fetch all and filter client-side by ownerEntraObjectId.
    const parts: string[] = [];

    if (options?.filter) {
      // Other filters (e.g. transactionType, categoryCode) may work
      parts.push(`$filter=${encodeURIComponent(options.filter)}`);
    }
    if (options?.top !== undefined) parts.push(`$top=${options.top}`);
    if (options?.skip !== undefined) parts.push(`$skip=${options.skip}`);
    if (options?.orderBy) parts.push(`$orderby=${encodeURIComponent(options.orderBy)}`);

    const queryString = parts.length > 0 ? `?${parts.join('&')}` : '';
    const rawData = await bcFetch(`${API_PATH}${queryString}`);

    // Filter client-side by ownerOid
    const cleanOid = ownerOid.replace(/[{}]/g, '').toLowerCase();
    const filtered = (rawData.value || []).filter(
      (v: BCTransactionResponseDTO) =>
        (v.ownerEntraObjectId || '').replace(/[{}]/g, '').toLowerCase() === cleanOid
    );

    return {
      value: filtered.map((v: BCTransactionResponseDTO) => this.mapToDomain(v)),
      nextLink: rawData['@odata.nextLink'],
    };
  }

  async getTransaction(ownerOid: string, systemId: string): Promise<Transaction | null> {
    try {
      const data = await bcFetch(`${API_PATH}(${systemId})`);
      const { accountMap, categoryMap } = await this.loadDictionaries(ownerOid);
      const transaction = this.mapToDomain(data, accountMap, categoryMap);
      
      if (transaction.ownerEntraObjectId !== ownerOid) {
        const error = new Error('Forbidden') as Error & { statusCode?: number };
        error.statusCode = 403;
        throw error;
      }
      return transaction;
    } catch (error: unknown) {
      if (error instanceof Error && (error as Error & { statusCode?: number }).statusCode === 404) return null;
      throw error;
    }
  }

  async createTransaction(ownerOid: string, dto: Omit<BCTransactionCreateDTO, 'ownerEntraObjectId'>): Promise<Transaction> {
    const createDto: BCTransactionCreateDTO = {
      ...dto,
      ownerEntraObjectId: ownerOid
    };

    const data = await bcFetch(API_PATH, {
      method: 'POST',
      body: JSON.stringify(createDto)
    });
    
    const { accountMap, categoryMap } = await this.loadDictionaries(ownerOid);
    return this.mapToDomain(data, accountMap, categoryMap);
  }

  async updateTransaction(
    ownerOid: string, 
    systemId: string, 
    etag: string, 
    dto: BCTransactionUpdateDTO
  ): Promise<Transaction> {
    const existing = await this.getTransaction(ownerOid, systemId);
    if (!existing) {
      const error = new Error('Not Found') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    const data = await bcFetch(`${API_PATH}(${systemId})`, {
      method: 'PATCH',
      headers: {
        'If-Match': etag
      },
      body: JSON.stringify(dto)
    });

    const { accountMap, categoryMap } = await this.loadDictionaries(ownerOid);
    return this.mapToDomain(data, accountMap, categoryMap);
  }

  async deleteTransaction(ownerOid: string, systemId: string, etag: string): Promise<void> {
    const existing = await this.getTransaction(ownerOid, systemId);
    if (!existing) {
      const error = new Error('Not Found') as Error & { statusCode?: number };
      error.statusCode = 404;
      throw error;
    }

    await bcFetch(`${API_PATH}(${systemId})`, {
      method: 'DELETE',
      headers: {
        'If-Match': etag
      }
    });
  }
}

export const transactionService = new TransactionService();
