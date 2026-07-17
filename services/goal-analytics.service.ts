import { SavingsGoal, GoalAnalytics } from '@/types/goal.types';
import { differenceInMonths, isValid, parseISO } from 'date-fns';

export class GoalAnalyticsService {
  /**
   * Calculates the analytics for a given SavingsGoal.
   * Right now, currentSaved is just openingSavedAmount, but this will serve as the integration
   * point when a contribution history table is added later.
   */
  public calculateAnalytics(goal: SavingsGoal): GoalAnalytics {
    // Determine the current saved amount.
    // In future sprints, this will be: goal.openingSavedAmount + sum(contributions.amount)
    const currentSaved = goal.openingSavedAmount;
    
    // Cap progress at 100% per business rules
    let progressPercentage = 0;
    if (goal.targetAmount > 0) {
      progressPercentage = (currentSaved / goal.targetAmount) * 100;
      if (progressPercentage > 100) progressPercentage = 100;
    }

    const remainingAmount = Math.max(0, goal.targetAmount - currentSaved);

    // Monthly required calculation
    let monthlyRequired = 0;
    let isOnTrack = true;
    let estimatedCompletionDate: string | undefined = undefined;

    if (remainingAmount > 0) {
      if (goal.targetDate) {
        const targetDate = parseISO(goal.targetDate);
        if (isValid(targetDate)) {
          const today = new Date();
          let monthsRemaining = differenceInMonths(targetDate, today);
          
          if (monthsRemaining <= 0) {
            monthsRemaining = 1; // If target date is this month or in the past, assume 1 month remaining to avoid division by zero
          }
          
          monthlyRequired = remainingAmount / monthsRemaining;
          
          // Check if they are on track based on their configured monthly contribution
          if (goal.monthlyContribution > 0) {
            isOnTrack = goal.monthlyContribution >= monthlyRequired;
          } else {
            isOnTrack = false;
          }
        }
      }

      // Estimate completion date based on their configured monthly contribution
      if (goal.monthlyContribution > 0) {
        const monthsToComplete = Math.ceil(remainingAmount / goal.monthlyContribution);
        const estimatedDate = new Date();
        estimatedDate.setMonth(estimatedDate.getMonth() + monthsToComplete);
        estimatedCompletionDate = estimatedDate.toISOString().split('T')[0];
      }
    } else {
      // Goal is reached
      estimatedCompletionDate = new Date().toISOString().split('T')[0];
    }

    return {
      progressPercentage,
      remainingAmount,
      monthlyRequired,
      estimatedCompletionDate,
      isOnTrack,
      currentSaved,
    };
  }

  /**
   * Aggregates analytics across multiple goals to calculate total progress.
   */
  public calculateTotalAnalytics(goals: SavingsGoal[]) {
    let totalTarget = 0;
    let totalSaved = 0;

    goals.forEach(goal => {
      // Only aggregate active or completed goals
      if (goal.status === 'Active' || goal.status === 'Completed' || goal.status === 'Paused') {
        totalTarget += goal.targetAmount;
        // In the future, replace with aggregated contributions if applicable
        totalSaved += Math.min(goal.openingSavedAmount, goal.targetAmount); // Cap at target
      }
    });

    const totalProgressPercentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
      totalTarget,
      totalSaved,
      totalProgressPercentage: Math.min(totalProgressPercentage, 100),
    };
  }
}

export const goalAnalyticsService = new GoalAnalyticsService();
