'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';

export function CreditCardFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete('skip'); // Reset pagination on filter change
      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    if (debouncedSearchTerm !== currentSearch) {
      router.push(`?${createQueryString('search', debouncedSearchTerm)}`);
    }
  }, [debouncedSearchTerm, router, searchParams, createQueryString]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`?${createQueryString('search', searchTerm)}`);
        }}
        className="flex flex-1 gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cards by name, bank, or last 4 digits..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <div className="flex gap-2">
        <Select
          value={searchParams.get('network') || undefined}
          onValueChange={(value) => {
            const strVal = value || '';
            router.push(`?${createQueryString('network', strVal === 'all' ? '' : strVal)}`);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Card Network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Networks</SelectItem>
            <SelectItem value="Visa">Visa</SelectItem>
            <SelectItem value="MasterCard">MasterCard</SelectItem>
            <SelectItem value="RuPay">RuPay</SelectItem>
            <SelectItem value="Amex">Amex</SelectItem>
            <SelectItem value="Discover">Discover</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get('isActive') || undefined}
          onValueChange={(value) => {
            const strVal = value || '';
            router.push(`?${createQueryString('isActive', strVal === 'all' ? '' : strVal)}`);
          }}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
