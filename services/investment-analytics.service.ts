import { Investment, InvestmentAnalytics } from '@/types/investment.types';

export class InvestmentAnalyticsService {
  /**
   * Calculates the analytics for a given Investment.
   */
  public calculateAnalytics(investment: Investment): InvestmentAnalytics {
    const profitOrLoss = investment.currentValue - investment.investedAmount;
    let returnPercentage = 0;
    
    if (investment.investedAmount > 0) {
      returnPercentage = (profitOrLoss / investment.investedAmount) * 100;
    }

    return {
      profitOrLoss,
      returnPercentage,
      isProfitable: profitOrLoss >= 0,
    };
  }

  /**
   * Aggregates analytics across multiple investments to calculate total portfolio value.
   */
  public calculatePortfolioAnalytics(investments: Investment[]) {
    let totalInvested = 0;
    let totalCurrentValue = 0;
    const allocationMap = new Map<string, number>();

    investments.forEach(inv => {
      // We may want to exclude Sold/Closed investments from total current value,
      // but usually the user will just see what's currently active.
      if (inv.status === 'Active' || inv.status === 'Matured') {
        totalInvested += inv.investedAmount;
        totalCurrentValue += inv.currentValue;

        const typeLabel = inv.type.replace(/([A-Z])/g, ' $1').trim();
        allocationMap.set(typeLabel, (allocationMap.get(typeLabel) || 0) + inv.currentValue);
      }
    });

    const totalProfitOrLoss = totalCurrentValue - totalInvested;
    const totalReturnPercentage = totalInvested > 0 ? (totalProfitOrLoss / totalInvested) * 100 : 0;

    const allocation = Array.from(allocationMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totalInvested,
      totalCurrentValue,
      totalProfitOrLoss,
      totalReturnPercentage,
      allocation,
    };
  }
}

export const investmentAnalyticsService = new InvestmentAnalyticsService();
