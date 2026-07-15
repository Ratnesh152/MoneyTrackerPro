'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface AccountPaginationProps {
  totalCount?: number;
  hasNextPage: boolean;
}

export function AccountPagination({ totalCount, hasNextPage }: AccountPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skip = parseInt(searchParams.get('skip') || '0', 10);
  const top = parseInt(searchParams.get('top') || '50', 10);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handlePrevious = () => {
    const newSkip = Math.max(0, skip - top);
    router.push(`?${createQueryString('skip', newSkip.toString())}`);
  };

  const handleNext = () => {
    const newSkip = skip + top;
    router.push(`?${createQueryString('skip', newSkip.toString())}`);
  };

  const currentPage = Math.floor(skip / top) + 1;
  const totalPages = totalCount ? Math.ceil(totalCount / top) : undefined;

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        {totalCount !== undefined ? `Total: ${totalCount} accounts` : ''}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handlePrevious}
            disabled={skip === 0}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPage} {totalPages ? `of ${totalPages}` : ''}
          </div>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleNext}
            disabled={!hasNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
