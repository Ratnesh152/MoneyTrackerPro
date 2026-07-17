import { env } from '@/config/env';
import { bcFetch } from './client';
import { SavingsGoal, BCSavingsGoalCreateDTO, BCSavingsGoalUpdateDTO, SavingsGoalType, SavingsGoalStatus } from '@/types/goal.types';
import { unstable_noStore as noStore } from 'next/cache';

const GOALS_ENDPOINT = `/companies(${env.BC_COMPANY_ID})/savingsGoals`;

function mapToDomain(dto: any): SavingsGoal {
  const cleanId = (id: string) => (id || '').replace(/[{}]/g, '').toLowerCase();
  return {
    etag: dto['@odata.etag'],
    systemId: cleanId(dto.systemId),
    entryNo: dto.entryNo,
    ownerEntraObjectId: cleanId(dto.ownerEntraObjectId),
    goalName: dto.goalName,
    goalType: dto.goalType as SavingsGoalType,
    targetAmount: dto.targetAmount,
    openingSavedAmount: dto.openingSavedAmount,
    targetDate: dto.targetDate !== '0001-01-01' ? dto.targetDate : undefined,
    monthlyContribution: dto.monthlyContribution,
    autoContribute: dto.autoContribute,
    status: dto.status as SavingsGoalStatus,
    notes: dto.notes || '',
    systemCreatedAt: dto.systemCreatedAt,
    systemModifiedAt: dto.systemModifiedAt,
  };
}

export const savingsGoalService = {
  getSavingsGoalsByOwner: async (
    ownerEntraObjectId: string
  ): Promise<SavingsGoal[]> => {
    noStore();
    
    if (!ownerEntraObjectId) {
      throw new Error('Owner Entra Object ID is required');
    }

    const parts: string[] = [];
    parts.push(`$top=100`);
    parts.push(`$orderby=targetDate asc`);
    
    const queryString = parts.length > 0 ? `?${parts.join('&')}` : '';
    const fullEndpoint = `/api/alletec/moneyTracker/v1.0${GOALS_ENDPOINT}${queryString}`;

    const response = await bcFetch(fullEndpoint);

    const cleanOid = ownerEntraObjectId.replace(/[{}]/g, '').toLowerCase();
    const filteredValue = (response.value || []).filter(
      (dto: any) => (dto.ownerEntraObjectId || '').replace(/[{}]/g, '').toLowerCase() === cleanOid
    );

    return filteredValue.map(mapToDomain);
  },

  getSavingsGoalById: async (
    systemId: string,
    ownerEntraObjectId: string
  ): Promise<SavingsGoal | null> => {
    noStore();
    
    const endpoint = `/api/alletec/moneyTracker/v1.0${GOALS_ENDPOINT}(${systemId})`;
    
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

  createSavingsGoal: async (
    dto: BCSavingsGoalCreateDTO
  ): Promise<{ success: boolean; data?: SavingsGoal; error?: string }> => {
    const endpoint = `/api/alletec/moneyTracker/v1.0${GOALS_ENDPOINT}`;
    
    try {
      const response = await bcFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(dto),
      });

      return { success: true, data: mapToDomain(response) };
    } catch (error) {
      console.error('Error creating savings goal:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  },

  updateSavingsGoal: async (
    systemId: string,
    ownerEntraObjectId: string,
    dto: BCSavingsGoalUpdateDTO,
    etag: string
  ): Promise<{ success: boolean; data?: SavingsGoal; error?: string }> => {
    try {
      await savingsGoalService.getSavingsGoalById(systemId, ownerEntraObjectId);

      const endpoint = `/api/alletec/moneyTracker/v1.0${GOALS_ENDPOINT}(${systemId})`;
      
      const response = await bcFetch(endpoint, {
        method: 'PATCH',
        headers: {
          'If-Match': etag,
        },
        body: JSON.stringify(dto),
      });

      return { success: true, data: mapToDomain(response) };
    } catch (error) {
      console.error('Error updating savings goal:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  },

  deleteSavingsGoal: async (
    systemId: string,
    ownerEntraObjectId: string,
    etag: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await savingsGoalService.getSavingsGoalById(systemId, ownerEntraObjectId);

      const endpoint = `/api/alletec/moneyTracker/v1.0${GOALS_ENDPOINT}(${systemId})`;
      
      await bcFetch(endpoint, {
        method: 'DELETE',
        headers: {
          'If-Match': etag,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      };
    }
  }
};
