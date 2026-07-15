import { WalletCards } from 'lucide-react';
import { AddAccountButton } from './AddAccountButton';

interface AccountEmptyStateProps {
  isSearch?: boolean;
}

export function AccountEmptyState({ isSearch }: AccountEmptyStateProps) {
  if (isSearch) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card">
        <WalletCards className="w-12 h-12 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No accounts found</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          No accounts match your current search filters. Try adjusting them.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card">
      <WalletCards className="w-12 h-12 mb-4 text-muted-foreground" />
      <h3 className="text-lg font-semibold">No accounts yet</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Add your first account to start tracking your finances.
      </p>
      <AddAccountButton />
    </div>
  );
}
