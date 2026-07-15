import { Skeleton as LoadingSkeleton } from '@/components/shared/LoadingSkeleton';

export default function TransactionsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <LoadingSkeleton className="h-9 w-48 mb-2" />
          <LoadingSkeleton className="h-5 w-64" />
        </div>
        <LoadingSkeleton className="h-10 w-32" />
      </div>

      <div className="flex gap-4">
        <LoadingSkeleton className="h-10 w-full md:w-1/3" />
        <LoadingSkeleton className="h-10 w-full md:w-1/4" />
        <LoadingSkeleton className="h-10 w-full md:w-1/4" />
      </div>

      <div className="rounded-md border bg-card shadow-sm p-4">
        <div className="space-y-4">
          <LoadingSkeleton className="h-10 w-full" />
          <LoadingSkeleton className="h-16 w-full" />
          <LoadingSkeleton className="h-16 w-full" />
          <LoadingSkeleton className="h-16 w-full" />
          <LoadingSkeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
}
