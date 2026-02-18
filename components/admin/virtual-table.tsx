'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T;
  label: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface VirtualTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  rowHeight?: number;
  visibleRows?: number;
  onRowClick?: (row: T) => void;
  className?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  searchableColumns?: (keyof T)[];
}

type SortDir = 'asc' | 'desc' | null;

export function VirtualTable<T extends Record<string, any>>({
  columns,
  data,
  rowHeight = 50,
  visibleRows = 10,
  onRowClick,
  className,
  isLoading = false,
  emptyMessage = 'No data found',
  searchableColumns = [],
}: VirtualTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((row) =>
        searchableColumns.some((col) =>
          String(row[col]).toLowerCase().includes(query)
        )
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => String(row[key as keyof T]) === String(value));
      }
    });

    // Apply sorting
    if (sortKey && sortDir) {
      result.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [data, searchQuery, filters, sortKey, sortDir, searchableColumns]);

  // Calculate visible range
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(startIndex + visibleRows + 1, processedData.length);
  const visibleData = processedData.slice(startIndex, endIndex);
  const totalHeight = processedData.length * rowHeight;
  const offsetY = startIndex * rowHeight;

  // Handle sort
  const handleSort = (key: keyof T) => {
    if (!columns.find((c) => c.key === key)?.sortable) return;

    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : sortDir === 'desc' ? null : 'asc');
      if (!sortDir || sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const getSortIcon = (col: Column<T>) => {
    if (sortKey !== col.key) return <ChevronsUpDown className="h-4 w-4 opacity-50" />;
    return sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      {/* Search & Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {columns
          .filter((c) => c.filterable)
          .map((col) => (
            <Select
              key={String(col.key)}
              value={filters[col.key] || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  [col.key]: value === 'all' ? undefined : value,
                }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={`Filter by ${col.label}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Array.from(new Set(data.map((row) => row[col.key]))).map((val) => (
                  <SelectItem key={String(val)} value={String(val)}>
                    {String(val)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        {(searchQuery || Object.values(filters).some(Boolean)) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setFilters({});
            }}
          >
            <X className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted border-b sticky top-0 z-10">
          <div className="flex">
            {columns.map((col) => (
              <div
                key={String(col.key)}
                className="px-4 py-3 text-sm font-semibold text-muted-foreground border-r last:border-r-0"
                style={{ width: col.width || '150px', minWidth: col.width || '150px' }}
              >
                {col.sortable ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    {col.label}
                    {getSortIcon(col)}
                  </button>
                ) : (
                  col.label
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Virtual Rows */}
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : processedData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <div
            ref={containerRef}
            className="h-[400px] overflow-y-auto"
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          >
            {/* Spacer for scrolled items */}
            <div style={{ height: offsetY }} />

            {/* Visible rows */}
            {visibleData.map((row, idx) => (
              <div
                key={startIndex + idx}
                className="flex border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => onRowClick?.(row)}
                style={{ height: rowHeight }}
              >
                {columns.map((col) => (
                  <div
                    key={String(col.key)}
                    className="px-4 py-3 text-sm truncate flex items-center border-r last:border-r-0"
                    style={{ width: col.width || '150px', minWidth: col.width || '150px' }}
                    title={String(row[col.key])}
                  >
                    {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                  </div>
                ))}
              </div>
            ))}

            {/* Spacer for scrolled items below */}
            <div style={{ height: Math.max(0, totalHeight - (offsetY + visibleData.length * rowHeight)) }} />
          </div>
        )}

        {/* Footer */}
        <div className="bg-muted px-4 py-2 text-xs text-muted-foreground border-t">
          Showing {Math.min(startIndex + visibleRows, processedData.length)} of {processedData.length} items
        </div>
      </div>
    </div>
  );
}
