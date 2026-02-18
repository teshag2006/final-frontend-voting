'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterOptions {
  search: string;
  category: string;
  status: string;
  dateFrom?: string;
  dateTo?: string;
}

interface ContestantFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DISABLED', label: 'Disabled' },
];

export function ContestantFilters({
  filters,
  onFiltersChange,
  categories,
  isLoading = false,
}: ContestantFiltersProps) {
  const debounceTimer = useRef<NodeJS.Timeout>();

  const handleSearchChange = useCallback(
    (value: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout(() => {
        onFiltersChange({ ...filters, search: value });
      }, 300);
    },
    [filters, onFiltersChange]
  );

  const handleReset = () => {
    onFiltersChange({
      search: '',
      category: '',
      status: '',
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.status || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-4">
      {/* Search and main filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search name or ID"
            defaultValue={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>

        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, category: value === 'all' ? '' : value })}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-48">
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

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value === 'all' ? '' : value })}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={handleReset} disabled={isLoading} className="w-full sm:w-auto">
            <X className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Date range filters (optional) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
            disabled={isLoading}
            className="text-sm"
          />
        </div>
        <div className="flex-1">
          <Input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
            disabled={isLoading}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
