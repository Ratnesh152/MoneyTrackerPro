export type SavingsGoalType = 
  | 'EmergencyFund'
  | 'Vacation'
  | 'Car'
  | 'House'
  | 'Education'
  | 'Retirement'
  | 'Wedding'
  | 'Custom';

export type SavingsGoalStatus = 
  | 'Active'
  | 'Completed'
  | 'Paused'
  | 'Cancelled';

export interface SavingsGoal {
  systemId: string;
  entryNo: number;
  ownerEntraObjectId: string;
  goalName: string;
  goalType: SavingsGoalType;
  targetAmount: number;
  openingSavedAmount: number;
  targetDate?: string;
  monthlyContribution: number;
  autoContribute: boolean;
  status: SavingsGoalStatus;
  notes?: string;
  systemCreatedAt: string;
  systemModifiedAt: string;
  etag: string;
}

export interface BCSavingsGoalCreateDTO {
  ownerEntraObjectId: string;
  goalName: string;
  goalType: SavingsGoalType;
  targetAmount: number;
  openingSavedAmount: number;
  targetDate?: string;
  monthlyContribution: number;
  autoContribute: boolean;
  status: SavingsGoalStatus;
  notes?: string;
}

export interface BCSavingsGoalUpdateDTO {
  goalName?: string;
  goalType?: SavingsGoalType;
  targetAmount?: number;
  openingSavedAmount?: number;
  targetDate?: string;
  monthlyContribution?: number;
  autoContribute?: boolean;
  status?: SavingsGoalStatus;
  notes?: string;
}

export interface GoalAnalytics {
  progressPercentage: number;
  remainingAmount: number;
  monthlyRequired: number;
  estimatedCompletionDate?: string;
  isOnTrack: boolean;
  currentSaved: number;
}
