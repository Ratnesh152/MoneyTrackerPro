'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';

export function LoanFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentSearch = searchParams.get('search') || '';
  const currentStatus = searchParams.get('status') || 'all';
  const currentType = searchParams.get('loanType') || 'all';
  const currentSort = searchParams.get('sort') || 'loanName_asc';

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' || value === '') {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      params.delete('skip'); // Reset pagination on filter change
      return params.toString();
    },
    [searchParams]
  );

  // Effect for debounced search
  useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      router.push(`?${createQueryString('search', debouncedSearch)}`);
    }
  }, [debouncedSearch, currentSearch, createQueryString, router]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Loan or Lender name..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <Select
        value={currentType}
        onValueChange={(val) => router.push(`?${createQueryString('loanType', val as string)}`)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Home">Home</SelectItem>
          <SelectItem value="Personal">Personal</SelectItem>
          <SelectItem value="Vehicle">Vehicle</SelectItem>
          <SelectItem value="Education">Education</SelectItem>
          <SelectItem value="Business">Business</SelectItem>
          <SelectItem value="Gold">Gold</SelectItem>
          <SelectItem value="Mortgage">Mortgage</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentStatus}
        onValueChange={(val) => router.push(`?${createQueryString('status', val as string)}`)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentSort}
        onValueChange={(val) => router.push(`?${createQueryString('sort', val as string)}`)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="loanName_asc">Name (A-Z)</SelectItem>
          <SelectItem value="principalAmount_desc">Highest Principal</SelectItem>
          <SelectItem value="interestRate_asc">Lowest Interest</SelectItem>
          <SelectItem value="startDate_desc">Newest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
