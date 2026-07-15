import React from 'react';
import ComingSoon from '@/components/shared/ComingSoon';

export default function GoalsPage() {
  return (
    <div className="flex flex-col w-full">
      <div className="pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
        <p className="text-muted-foreground">Manage your goals settings and data.</p>
      </div>
      <div className="bg-card rounded-xl border shadow-sm p-8">
        <ComingSoon title="Goals Module" />
      </div>
    </div>
  );
}
