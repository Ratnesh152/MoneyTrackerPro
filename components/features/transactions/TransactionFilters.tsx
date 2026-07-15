'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Initialize from URL once on mount only
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 300);

  const [type, setType] = useState(searchParams.get('type') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  // Track if this is the initial render — skip the push on first render
  const isFirstRender = useRef(true);

  // Update URL only when filter values actually change (not on searchParams change)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (debouncedSearch) params.set('search', debouncedSearch);
    if (type && type !== 'all') params.set('type', type);
    if (category) params.set('category', category);

    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, type, category]);
  // ↑ Intentionally exclude router & searchParams to prevent infinite loop

  const clearFilters = () => {
    setSearch('');
    setType('');
    setCategory('');
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search descriptions or references..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Select value={type} onValueChange={(v) => setType(v || '')}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Income">Income</SelectItem>
          <SelectItem value="Expense">Expense</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Category Code (e.g. FOOD)"
        className="w-full sm:w-[200px]"
        value={category}
        onChange={(e) => setCategory(e.target.value.toUpperCase())}
      />

      {(search || type || category) && (
        <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
