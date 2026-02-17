'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
  expandable?: boolean;
}

interface SearchFiltersProps {
  groups: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFiltersChange: (filters: Record<string, string[]>) => void;
  onClearAll?: () => void;
  className?: string;
}

export function SearchFilters({
  groups,
  selectedFilters,
  onFiltersChange,
  onClearAll,
  className,
}: SearchFiltersProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.filter((g) => !g.expandable).map((g) => g.id))
  );

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleFilterChange = (groupId: string, optionId: string, checked: boolean) => {
    const updated = { ...selectedFilters };
    if (!updated[groupId]) {
      updated[groupId] = [];
    }

    if (checked) {
      updated[groupId] = [...updated[groupId], optionId];
    } else {
      updated[groupId] = updated[groupId].filter((id) => id !== optionId);
    }

    onFiltersChange(updated);
  };

  const handleRemoveFilter = (groupId: string, optionId: string) => {
    const updated = { ...selectedFilters };
    updated[groupId] = updated[groupId].filter((id) => id !== optionId);
    onFiltersChange(updated);
  };

  const totalActiveFilters = Object.values(selectedFilters).flat().length;

  return (
    <div className={cn('w-full', className)}>
      {/* Header with Clear All */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {totalActiveFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs h-auto px-2 py-1"
          >
            Clear all ({totalActiveFilters})
          </Button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="space-y-4">
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const activeCount = (selectedFilters[group.id] || []).length;

          return (
            <div key={group.id} className="border rounded-lg p-4">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between text-left font-medium text-sm hover:text-primary transition-colors"
                aria-expanded={isExpanded}
              >
                <span className="flex items-center gap-2">
                  {group.title}
                  {activeCount > 0 && (
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      {activeCount}
                    </Badge>
                  )}
                </span>
                {group.expandable && (
                  <ChevronDown
                    className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                  />
                )}
              </button>

              {/* Group Options */}
              {isExpanded && (
                <div className="mt-3 space-y-2">
                  {group.options.map((option) => {
                    const isChecked = (selectedFilters[group.id] || []).includes(option.id);

                    return (
                      <label
                        key={option.id}
                        className="flex items-center gap-2 text-sm cursor-pointer group"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleFilterChange(group.id, option.id, checked as boolean)
                          }
                          aria-label={option.label}
                        />
                        <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors">
                          {option.label}
                        </span>
                        {option.count !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            ({option.count})
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Filter Badges */}
      {totalActiveFilters > 0 && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-3">Applied Filters:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(selectedFilters).map(([groupId, optionIds]) =>
              optionIds.map((optionId) => {
                const group = groups.find((g) => g.id === groupId);
                const option = group?.options.find((o) => o.id === optionId);

                if (!option) return null;

                return (
                  <Badge key={`${groupId}-${optionId}`} variant="outline" className="gap-1">
                    {option.label}
                    <button
                      onClick={() => handleRemoveFilter(groupId, optionId)}
                      className="ml-1 hover:text-destructive transition-colors"
                      aria-label={`Remove filter: ${option.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
