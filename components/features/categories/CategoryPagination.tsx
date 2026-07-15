'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryPaginationProps {
  totalCount: number;
  pageSize: number;
}

export function CategoryPagination({ totalCount, pageSize }: CategoryPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const skip = parseInt(searchParams.get('skip') || '0', 10);
  const top = parseInt(searchParams.get('top') || pageSize.toString(), 10);

  const hasNextPage = skip + top < totalCount;
  const hasPreviousPage = skip > 0;

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      Object.entries(params).forEach(([name, value]) => {
        if (value === null) {
          newSearchParams.delete(name);
        } else {
          newSearchParams.set(name, value);
        }
      });

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const onNextPage = () => {
    if (!hasNextPage) return;
    router.push(`?${createQueryString({ skip: (skip + top).toString() })}`);
  };

  const onPreviousPage = () => {
    if (!hasPreviousPage) return;
    const newSkip = Math.max(0, skip - top);
    router.push(`?${createQueryString({ skip: newSkip.toString() })}`);
  };

  const startRecord = totalCount === 0 ? 0 : skip + 1;
  const endRecord = Math.min(skip + top, totalCount);

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-muted-foreground">
        Showing {startRecord} to {endRecord} of {totalCount} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={!hasPreviousPage}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
