'use client';

import { MoreVertical, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryStatusBadge } from './category-status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface CategoryData {
  id: string;
  name: string;
  eventId: string;
  eventName: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalContestants: number;
  totalVotes: number;
  revenue: number;
  createdAt: string;
}

interface CategoriesTableProps {
  categories: CategoryData[];
  isLoading?: boolean;
  sortBy?: 'name' | 'created' | 'status';
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (by: string, order: string) => void;
  onEdit?: (category: CategoryData) => void;
  onDelete?: (category: CategoryData) => void;
  onDeactivate?: (category: CategoryData) => void;
}

export function CategoriesTable({
  categories,
  isLoading = false,
  sortBy = 'created',
  sortOrder = 'desc',
  onSortChange,
  onEdit,
  onDelete,
  onDeactivate,
}: CategoriesTableProps) {
  const handleSort = (column: string) => {
    const newOrder = sortBy === column && sortOrder === 'desc' ? 'asc' : 'desc';
    onSortChange?.(column, newOrder);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <ChevronUp className="h-4 w-4 opacity-30" />;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">No categories created for this event.</p>
        <p className="text-xs text-muted-foreground">Create a category to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              <button
                onClick={() => handleSort('name')}
                className="flex items-center gap-2 hover:text-primary transition-colors"
                aria-label="Sort by category name"
              >
                Category Name
                <SortIcon column="name" />
              </button>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              Event Name
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-2 hover:text-primary transition-colors"
                aria-label="Sort by status"
              >
                Status
                <SortIcon column="status" />
              </button>
            </th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">
              Total Contestants
            </th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">
              Total Votes
            </th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">
              Revenue
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              <button
                onClick={() => handleSort('created')}
                className="flex items-center gap-2 hover:text-primary transition-colors"
                aria-label="Sort by creation date"
              >
                Created At
                <SortIcon column="created" />
              </button>
            </th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {categories.map((category) => (
            <tr
              key={category.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {category.name}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {category.eventName}
              </td>
              <td className="px-4 py-3">
                <CategoryStatusBadge status={category.status} />
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground">
                {category.totalContestants}
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground">
                {category.totalVotes.toLocaleString()} votes
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground">
                {formatCurrency(category.revenue)}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {formatDate(category.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label={`Actions for ${category.name}`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(category)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    {category.status === 'ACTIVE' && (
                      <DropdownMenuItem onClick={() => onDeactivate?.(category)}>
                        <span>Deactivate</span>
                      </DropdownMenuItem>
                    )}
                    {category.totalContestants === 0 && (
                      <DropdownMenuItem
                        onClick={() => onDelete?.(category)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
