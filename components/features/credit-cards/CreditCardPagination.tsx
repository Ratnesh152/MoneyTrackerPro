'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CreditCardPaginationProps {
  totalCount?: number;
  hasNextPage: boolean;
}

export function CreditCardPagination({ totalCount, hasNextPage }: CreditCardPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const skip = parseInt(searchParams.get('skip') || '0', 10);
  const top = parseInt(searchParams.get('top') || '50', 10);
  
  const handlePrevious = () => {
    const newSkip = Math.max(0, skip - top);
    const params = new URLSearchParams(searchParams.toString());
    params.set('skip', newSkip.toString());
    router.push(`?${params.toString()}`);
  };

  const handleNext = () => {
    const newSkip = skip + top;
    const params = new URLSearchParams(searchParams.toString());
    params.set('skip', newSkip.toString());
    router.push(`?${params.toString()}`);
  };

  if (skip === 0 && !hasNextPage) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        {totalCount !== undefined ? `Total ${totalCount} credit cards` : 'Showing results'}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={skip === 0}
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
