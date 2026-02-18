'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EventStatus = 'all' | 'live' | 'upcoming' | 'closed' | 'archived';
export type EventSort = 'newest' | 'popular' | 'trending';

interface EventFiltersProps {
  categories?: { id: string; name: string }[];
  onFiltersChange?: (filters: EventFiltersState) => void;
  className?: string;
}

export interface EventFiltersState {
  search: string;
  status: EventStatus;
  category?: string;
  sort: EventSort;
}

export function EventFilters({ categories, onFiltersChange, className }: EventFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<EventFiltersState>({
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as EventStatus) || 'all',
    category: searchParams.get('category') || undefined,
    sort: (searchParams.get('sort') as EventSort) || 'newest',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof EventFiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
    updateURL(newFilters);
  };

  const handleSearch = (value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
    updateURL(newFilters);
  };

  const updateURL = (updatedFilters: EventFiltersState) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updatedFilters.search) params.set('search', updatedFilters.search);
    else params.delete('search');

    if (updatedFilters.status !== 'all') params.set('status', updatedFilters.status);
    else params.delete('status');

    if (updatedFilters.category) params.set('category', updatedFilters.category);
    else params.delete('category');

    if (updatedFilters.sort !== 'newest') params.set('sort', updatedFilters.sort);
    else params.delete('sort');

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : window.location.pathname);
  };

  const handleClear = () => {
    const clearedFilters: EventFiltersState = {
      search: '',
      status: 'all',
      category: undefined,
      sort: 'newest',
    };
    setFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
    router.push(window.location.pathname);
  };

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.sort !== 'newest' ? 1 : 0);

  const statusOptions: { value: EventStatus; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'live', label: 'Live Now' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'closed', label: 'Closed' },
    { value: 'archived', label: 'Archived' },
  ];

  const sortOptions: { value: EventSort; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' },
  ];

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10"
          aria-label="Search events"
        />
        {filters.search && (
          <button
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Main Filters */}
        <div className="flex gap-2 flex-wrap">
          {/* Status Filter */}
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-[140px]" aria-label="Filter by event status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter (if available) */}
          {categories && categories.length > 0 && (
            <Select
              value={filters.category || 'all'}
              onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-[140px]" aria-label="Filter by category">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Sort Filter */}
          <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
            <SelectTrigger className="w-[140px]" aria-label="Sort events by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filter Count */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="secondary">{activeFilterCount} active</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full gap-2"
        >
          <Filter className="h-4 w-4" />
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile Expanded Filters */}
      {isExpanded && (
        <div className="md:hidden p-4 bg-secondary/50 rounded-lg space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Event Status</label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {categories && categories.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
