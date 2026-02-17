'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface LeaderboardFiltersProps {
  categories: Array<{ id: string; name: string }>;
  onCategoryChange?: (categoryId: string | undefined) => void;
  onPendingToggle?: (includePending: boolean) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
  isLoading?: boolean;
}

export function LeaderboardFilters({
  categories,
  onCategoryChange,
  onPendingToggle,
  onExport,
  isLoading = false,
}: LeaderboardFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [includePending, setIncludePending] = useState(false);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    onCategoryChange?.(value === 'all' ? undefined : value);
  };

  const handlePendingToggle = () => {
    const newValue = !includePending;
    setIncludePending(newValue);
    onPendingToggle?.(newValue);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-slate-200 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
        {/* Category Filter */}
        <div className="flex-1 sm:flex-none">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
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
        </div>

        {/* Pending Votes Toggle */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="pending"
            checked={includePending}
            onCheckedChange={handlePendingToggle}
            disabled={isLoading}
          />
          <label
            htmlFor="pending"
            className="text-sm font-medium text-slate-700 cursor-pointer"
          >
            Include Pending
          </label>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport?.('csv')}
          disabled={isLoading}
        >
          Export CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport?.('pdf')}
          disabled={isLoading}
        >
          Export PDF
        </Button>
      </div>
    </div>
  );
}
