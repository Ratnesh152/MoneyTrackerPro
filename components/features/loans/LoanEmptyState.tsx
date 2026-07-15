import { Landmark } from 'lucide-react';
import { AddLoanButton } from './AddLoanButton';

export function LoanEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card/50 min-h-[400px]">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
        <Landmark className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No loans tracked</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        Start tracking your liabilities like home loans, personal loans, or vehicle loans to manage your finances better.
      </p>
      <AddLoanButton />
    </div>
  );
}
