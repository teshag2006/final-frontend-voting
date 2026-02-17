'use client';

import { useCallback, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface PaymentFilterOptions {
  status: string;
  event: string;
  gateway: string;
  dateFrom: string;
  dateTo: string;
  minAmount: number | '';
  maxAmount: number | '';
  fraudRisk: string;
  searchQuery: string;
}

interface PaymentFiltersProps {
  filters: PaymentFilterOptions;
  onFiltersChange: (filters: PaymentFilterOptions) => void;
  events?: Array<{ id: string; name: string }>;
  gateways?: string[];
  isLoading?: boolean;
}

const statuses = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'FLAGGED', label: 'Flagged' },
];

const fraudRisks = [
  { value: '', label: 'All Risk Levels' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

export function PaymentFilters({
  filters,
  onFiltersChange,
  events = [],
  gateways = [],
  isLoading = false,
}: PaymentFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);

  const debouncedSearch = useCallback((value: string) => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, searchQuery: value });
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, onFiltersChange]);

  const handleSearch = (value: string) => {
    setLocalSearch(value);
    debouncedSearch(value);
  };

  const handleReset = () => {
    setLocalSearch('');
    onFiltersChange({
      status: '',
      event: '',
      gateway: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      fraudRisk: '',
      searchQuery: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Input
            placeholder="Search Payment ID or Reference"
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={isLoading}
            className="pl-10"
            aria-label="Search payments"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {/* Status */}
        <div className="w-full sm:w-40">
          <Select value={filters.status} onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value })
          }>
            <SelectTrigger disabled={isLoading} aria-label="Filter by status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Event */}
        <div className="flex-1">
          <Select value={filters.event} onValueChange={(value) =>
            onFiltersChange({ ...filters, event: value })
          }>
            <SelectTrigger disabled={isLoading} aria-label="Filter by event">
              <SelectValue placeholder="All Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Events</SelectItem>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gateway */}
        <div className="flex-1">
          <Select value={filters.gateway} onValueChange={(value) =>
            onFiltersChange({ ...filters, gateway: value })
          }>
            <SelectTrigger disabled={isLoading} aria-label="Filter by payment gateway">
              <SelectValue placeholder="All Gateways" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Gateways</SelectItem>
              {gateways.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fraud Risk */}
        <div className="flex-1">
          <Select value={filters.fraudRisk} onValueChange={(value) =>
            onFiltersChange({ ...filters, fraudRisk: value })
          }>
            <SelectTrigger disabled={isLoading} aria-label="Filter by fraud risk">
              <SelectValue placeholder="All Risk Levels" />
            </SelectTrigger>
            <SelectContent>
              {fraudRisks.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Date Range */}
        <div className="flex-1">
          <Input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom}
            onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
            disabled={isLoading}
            aria-label="From date"
          />
        </div>
        <div className="flex-1">
          <Input
            type="date"
            placeholder="To Date"
            value={filters.dateTo}
            onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
            disabled={isLoading}
            aria-label="To date"
          />
        </div>

        {/* Amount Range */}
        <div className="flex-1">
          <Input
            type="number"
            placeholder="Min Amount"
            value={filters.minAmount}
            onChange={(e) => onFiltersChange({ ...filters, minAmount: e.target.value ? Number(e.target.value) : '' })}
            disabled={isLoading}
            min="0"
            aria-label="Minimum amount"
          />
        </div>
        <div className="flex-1">
          <Input
            type="number"
            placeholder="Max Amount"
            value={filters.maxAmount}
            onChange={(e) => onFiltersChange({ ...filters, maxAmount: e.target.value ? Number(e.target.value) : '' })}
            disabled={isLoading}
            min="0"
            aria-label="Maximum amount"
          />
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isLoading}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
