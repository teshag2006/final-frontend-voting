'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FraudFilterOptions {
  riskLevel: string;
  status: string;
  fraudType: string;
  event: string;
  dateFrom: string;
  dateTo: string;
  ipAddress: string;
  deviceId: string;
  searchQuery: string;
}

interface FraudFiltersProps {
  onFiltersChange: (filters: FraudFilterOptions) => void;
  eventOptions?: string[];
  isLoading?: boolean;
}

export function FraudFilters({
  onFiltersChange,
  eventOptions = [],
  isLoading = false,
}: FraudFiltersProps) {
  const [filters, setFilters] = useState<FraudFilterOptions>({
    riskLevel: '',
    status: '',
    fraudType: '',
    event: '',
    dateFrom: '',
    dateTo: '',
    ipAddress: '',
    deviceId: '',
    searchQuery: '',
  });

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  const handleFilterChange = useCallback(
    (key: keyof FraudFilterOptions, value: string) => {
      setFilters((prev) => {
        const updated = { ...prev, [key]: value };
        onFiltersChange(updated);
        return updated;
      });
    },
    [onFiltersChange]
  );

  const handleSearchChange = (value: string) => {
    clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      handleFilterChange('searchQuery', value);
    }, 300);
    setSearchTimeout(timeout);
  };

  const handleReset = () => {
    const empty: FraudFilterOptions = {
      riskLevel: '',
      status: '',
      fraudType: '',
      event: '',
      dateFrom: '',
      dateTo: '',
      ipAddress: '',
      deviceId: '',
      searchQuery: '',
    };
    setFilters(empty);
    onFiltersChange(empty);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8"
            disabled={isLoading}
          >
            <X className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Case ID, User ID, IP, Device..."
          defaultValue={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          disabled={isLoading}
          className="pl-9"
        />
      </div>

      {/* Risk Level */}
      <Select
        value={filters.riskLevel || 'all'}
        onValueChange={(val) => handleFilterChange('riskLevel', val === 'all' ? '' : val)}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Risk Level: All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="LOW">Low (0-30)</SelectItem>
          <SelectItem value="MEDIUM">Medium (31-60)</SelectItem>
          <SelectItem value="HIGH">High (61-80)</SelectItem>
          <SelectItem value="CRITICAL">Critical (81-100)</SelectItem>
        </SelectContent>
      </Select>

      {/* Status */}
      <Select
        value={filters.status || 'all'}
        onValueChange={(val) => handleFilterChange('status', val === 'all' ? '' : val)}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Status: All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="REVIEWED">Reviewed</SelectItem>
          <SelectItem value="BLOCKED">Blocked</SelectItem>
          <SelectItem value="OVERRIDDEN">Overridden</SelectItem>
        </SelectContent>
      </Select>

      {/* Fraud Type */}
      <Select
        value={filters.fraudType || 'all'}
        onValueChange={(val) => handleFilterChange('fraudType', val === 'all' ? '' : val)}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Type: All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="VOTE">Vote</SelectItem>
          <SelectItem value="PAYMENT">Payment</SelectItem>
          <SelectItem value="LOGIN">Login</SelectItem>
        </SelectContent>
      </Select>

      {/* Event */}
      {eventOptions.length > 0 && (
        <Select
          value={filters.event || 'all'}
          onValueChange={(val) => handleFilterChange('event', val === 'all' ? '' : val)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Event: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {eventOptions.map((event) => (
              <SelectItem key={event} value={event}>
                {event}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          disabled={isLoading}
          placeholder="From"
        />
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          disabled={isLoading}
          placeholder="To"
        />
      </div>

      {/* IP Address */}
      <Input
        placeholder="Filter by IP Address"
        value={filters.ipAddress}
        onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
        disabled={isLoading}
        className="text-xs font-mono"
      />

      {/* Device ID */}
      <Input
        placeholder="Filter by Device Fingerprint"
        value={filters.deviceId}
        onChange={(e) => handleFilterChange('deviceId', e.target.value)}
        disabled={isLoading}
        className="text-xs font-mono"
      />
    </div>
  );
}
