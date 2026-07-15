'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransition } from 'react';

interface TransactionPaginationProps {
  nextLink?: string;
  skip: number;
  top: number;
  hasMore: boolean;
}

export function TransactionPagination({ nextLink, skip, top, hasMore }: TransactionPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (newSkip: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSkip > 0) {
      params.set('skip', newSkip.toString());
    } else {
      params.delete('skip');
    }
    
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center justify-between px-2 py-4 border-t">
      <div className="text-sm text-muted-foreground">
        Showing items {skip + 1} - {skip + top}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(Math.max(0, skip - top))}
          disabled={skip === 0 || isPending}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(skip + top)}
          disabled={(!hasMore && !nextLink) || isPending}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
