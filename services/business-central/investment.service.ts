import { env } from '@/config/env';
import { bcFetch } from './client';
import { Investment, BCInvestmentCreateDTO, BCInvestmentUpdateDTO, InvestmentType, InvestmentStatus } from '@/types/investment.types';
import { unstable_noStore as noStore } from 'next/cache';

const INVESTMENTS_ENDPOINT = `/companies(${env.BC_COMPANY_ID})/investments`;

function mapToDomain(dto: any): Investment {
  const cleanId = (id: string) => (id || '').replace(/[{}]/g, '').toLowerCase();
  return {
    etag: dto['@odata.etag'],
    systemId: cleanId(dto.systemId),
    entryNo: dto.entryNo,
    ownerEntraObjectId: cleanId(dto.ownerEntraObjectId),
    name: dto.name,
    type: dto.type as InvestmentType,
    investedAmount: dto.investedAmount,
    currentValue: dto.currentValue,
    status: dto.status as InvestmentStatus,
    notes: dto.notes || '',
    systemCreatedAt: dto.systemCreatedAt,
    systemModifiedAt: dto.systemModifiedAt,
  };
}

export const investmentService = {
  getInvestmentsByOwner: async (
    ownerEntraObjectId: string
  ): Promise<Investment[]> => {
    noStore();
    
    if (!ownerEntraObjectId) {
      throw new Error('Owner Entra Object ID is required');
    }

    const parts: string[] = [];
    parts.push(`$top=200`);
    parts.push(`$orderby=name asc`);
    
    const queryString = parts.length > 0 ? `?${parts.join('&')}` : '';
    const fullEndpoint = `/api/alletec/moneyTracker/v1.0${INVESTMENTS_ENDPOINT}${queryString}`;

    const response = await bcFetch(fullEndpoint);

    const cleanOid = ownerEntraObjectId.replace(/[{}]/g, '').toLowerCase();
    const filteredValue = (response.value || []).filter(
      (dto: any) => (dto.ownerEntraObjectId || '').replace(/[{}]/g, '').toLowerCase() === cleanOid
    );

    return filteredValue.map(mapToDomain);
  },

  getInvestmentById: async (
    systemId: string,
    ownerEntraObjectId: string
  ): Promise<Investment | null> => {
    noStore();
    
    const endpoint = `/api/alletec/moneyTracker/v1.0${INVESTMENTS_ENDPOINT}(${systemId})`;
    
    try {
      const dto = await bcFetch(endpoint);
      
      const dtoOid = dto.ownerEntraObjectId?.replace(/[{}]/g, '').toLowerCase();
      const reqOid = ownerEntraObjectId?.replace(/[{}]/g, '').toLowerCase();
      if (dtoOid !== reqOid) {
        throw new Error('NotFoundError');
      }
      
      return mapToDomain(dto);
    } catch (error) {
      const err = error as Error;
      if (err.name === 'NotFoundError') {
        return null;
      }
      throw error;
    }
  },

  createInvestment: async (
    dto: BCInvestmentCreateDTO
  ): Promise<{ success: boolean; data?: Investment; error?: string }> => {
    const endpoint = `/api/alletec/moneyTracker/v1.0${INVESTMENTS_ENDPOINT}`;
    
    try {
      const response = await bcFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(dto),
      });

      return { success: true, data: mapToDomain(response) };
    } catch (error) {
      console.error('Error creating investment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  },

  updateInvestment: async (
    systemId: string,
    ownerEntraObjectId: string,
    dto: BCInvestmentUpdateDTO,
    etag: string
  ): Promise<{ success: boolean; data?: Investment; error?: string }> => {
    try {
      await investmentService.getInvestmentById(systemId, ownerEntraObjectId);

      const endpoint = `/api/alletec/moneyTracker/v1.0${INVESTMENTS_ENDPOINT}(${systemId})`;
      
      const response = await bcFetch(endpoint, {
        method: 'PATCH',
        headers: {
          'If-Match': etag,
        },
        body: JSON.stringify(dto),
      });

      return { success: true, data: mapToDomain(response) };
    } catch (error) {
      console.error('Error updating investment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  },

  deleteInvestment: async (
    systemId: string,
    ownerEntraObjectId: string,
    etag: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await investmentService.getInvestmentById(systemId, ownerEntraObjectId);

      const endpoint = `/api/alletec/moneyTracker/v1.0${INVESTMENTS_ENDPOINT}(${systemId})`;
      
      await bcFetch(endpoint, {
        method: 'DELETE',
        headers: {
          'If-Match': etag,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting investment:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  }
};
