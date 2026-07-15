'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LoanPaginationProps {
  totalCount: number;
  pageSize?: number;
}

export function LoanPagination({ totalCount, pageSize = 50 }: LoanPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSkip = Number(searchParams.get('skip')) || 0;
  
  const hasNextPage = currentSkip + pageSize < totalCount;
  const hasPrevPage = currentSkip > 0;

  const handleNext = () => {
    if (!hasNextPage) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('skip', (currentSkip + pageSize).toString());
    router.push(`?${params.toString()}`);
  };

  const handlePrev = () => {
    if (!hasPrevPage) return;
    const params = new URLSearchParams(searchParams.toString());
    const newSkip = Math.max(0, currentSkip - pageSize);
    if (newSkip === 0) {
      params.delete('skip');
    } else {
      params.set('skip', newSkip.toString());
    }
    router.push(`?${params.toString()}`);
  };

  if (totalCount <= pageSize) return null;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {currentSkip + 1} to Math.min(currentSkip + pageSize, totalCount) of {totalCount} loans
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={!hasPrevPage}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={!hasNextPage}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
