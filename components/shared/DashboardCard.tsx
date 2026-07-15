import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function DashboardCard({
  title,
  description,
  children,
  className,
  action,
}: DashboardCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden", className)}>
      {(title || description || action) && (
        <div className="flex flex-col space-y-1.5 p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            {title && <h3 className="font-semibold leading-none tracking-tight">{title}</h3>}
            {action && <div>{action}</div>}
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="p-6 pt-4">
        {children}
      </div>
    </div>
  );
}
