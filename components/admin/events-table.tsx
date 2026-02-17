'use client';

import { MoreVertical, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventStatusBadge } from './event-status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface EventData {
  id: string;
  name: string;
  description?: string;
  status: 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  startDate: string;
  endDate: string;
  totalVotes: number;
  totalRevenue: number;
  createdAt: string;
}

interface EventsTableProps {
  events: EventData[];
  isLoading?: boolean;
  sortBy?: 'name' | 'created' | 'status';
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (by: string, order: string) => void;
  onEdit?: (event: EventData) => void;
  onDelete?: (event: EventData) => void;
  onChangeStatus?: (event: EventData, newStatus: string) => void;
}

export function EventsTable({
  events,
  isLoading = false,
  sortBy = 'created',
  sortOrder = 'desc',
  onSortChange,
  onEdit,
  onDelete,
  onChangeStatus,
}: EventsTableProps) {
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

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">No events created yet.</p>
        <p className="text-xs text-muted-foreground">Create your first event to get started.</p>
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
              >
                Event Name
                <SortIcon column="name" />
              </button>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                Status
                <SortIcon column="status" />
              </button>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">Start Date</th>
            <th className="px-4 py-3 text-left font-semibold text-foreground">End Date</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground">Total Votes</th>
            <th className="px-4 py-3 text-right font-semibold text-foreground hidden sm:table-cell">
              Revenue
            </th>
            <th className="px-4 py-3 text-left font-semibold text-foreground hidden lg:table-cell">
              <button
                onClick={() => handleSort('created')}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                Created At
                <SortIcon column="created" />
              </button>
            </th>
            <th className="px-4 py-3 text-center font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="border-b border-border hover:bg-muted/50 transition-colors"
            >
              <td className="px-4 py-4 font-medium text-foreground">{event.name}</td>
              <td className="px-4 py-4">
                <EventStatusBadge status={event.status} />
              </td>
              <td className="px-4 py-4 text-muted-foreground text-xs sm:text-sm">
                {new Date(event.startDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-4 text-muted-foreground text-xs sm:text-sm">
                {new Date(event.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-4 text-right font-semibold text-foreground">
                {(event.totalVotes / 1000).toFixed(1)}K
              </td>
              <td className="px-4 py-4 text-right font-semibold text-foreground hidden sm:table-cell">
                ${(event.totalRevenue / 1000).toFixed(1)}K
              </td>
              <td className="px-4 py-4 text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">
                {new Date(event.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-4 py-4 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label="Event actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => onEdit?.(event)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    {event.status === 'UPCOMING' && (
                      <DropdownMenuItem
                        onClick={() => onChangeStatus?.(event, 'ACTIVE')}
                        className="cursor-pointer"
                      >
                        Activate Event
                      </DropdownMenuItem>
                    )}
                    {event.status === 'ACTIVE' && (
                      <DropdownMenuItem
                        onClick={() => onChangeStatus?.(event, 'CLOSED')}
                        className="cursor-pointer"
                      >
                        Close Event
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete?.(event)}
                      className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
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
