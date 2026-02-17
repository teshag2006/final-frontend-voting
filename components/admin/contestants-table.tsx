'use client';

import { MoreVertical, ChevronUp, ChevronDown, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContestantStatusBadge, type ContestantStatus } from './contestant-status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export interface ContestantData {
  id: string;
  name: string;
  bio?: string;
  category: string;
  categoryId: string;
  status: ContestantStatus;
  totalVotes: number;
  revenue: number;
  createdAt: string;
  avatar?: string;
  email?: string;
}

interface ContestantsTableProps {
  contestants: ContestantData[];
  isLoading?: boolean;
  sortBy?: 'name' | 'created' | 'votes' | 'revenue';
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (by: string, order: string) => void;
  onView?: (contestant: ContestantData) => void;
  onEdit?: (contestant: ContestantData) => void;
  onApprove?: (contestant: ContestantData) => void;
  onReject?: (contestant: ContestantData) => void;
  onDisable?: (contestant: ContestantData) => void;
  onDelete?: (contestant: ContestantData) => void;
  pageInfo?: { current: number; total: number; perPage: number };
}

export function ContestantsTable({
  contestants,
  isLoading = false,
  sortBy = 'created',
  sortOrder = 'desc',
  onSortChange,
  onView,
  onEdit,
  onApprove,
  onReject,
  onDisable,
  onDelete,
  pageInfo,
}: ContestantsTableProps) {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const canApprove = (contestant: ContestantData) =>
    contestant.status === 'PENDING' || contestant.status === 'REJECTED';
  const canReject = (contestant: ContestantData) => contestant.status === 'PENDING' || contestant.status === 'APPROVED';
  const canDisable = (contestant: ContestantData) => contestant.status === 'ACTIVE' || contestant.status === 'APPROVED';

  if (contestants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No contestants found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Avatar</th>
            <th className="px-4 py-3 text-left font-medium">ID</th>
            <th
              className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-1">
                Full Name
                <SortIcon column="name" />
              </div>
            </th>
            <th className="px-4 py-3 text-left font-medium">Category</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Votes</th>
            <th className="px-4 py-3 text-right font-medium">Revenue</th>
            <th
              className="px-4 py-3 text-left font-medium cursor-pointer hover:bg-muted"
              onClick={() => handleSort('created')}
            >
              <div className="flex items-center gap-1">
                Created
                <SortIcon column="created" />
              </div>
            </th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contestants.map((contestant) => (
            <tr key={contestant.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="px-4 py-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contestant.avatar} alt={contestant.name} />
                  <AvatarFallback>{getInitials(contestant.name)}</AvatarFallback>
                </Avatar>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{contestant.id}</td>
              <td className="px-4 py-3 font-medium text-foreground">{contestant.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{contestant.category}</td>
              <td className="px-4 py-3">
                <ContestantStatusBadge status={contestant.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <span>{contestant.totalVotes.toLocaleString()} votes</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">{formatCurrency(contestant.revenue)}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(contestant.createdAt)}</td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isLoading}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(contestant)}>
                      <span>View</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(contestant)}>
                      <span>Edit</span>
                    </DropdownMenuItem>

                    {canApprove(contestant) && (
                      <DropdownMenuItem onClick={() => onApprove?.(contestant)}>
                        <span>Approve</span>
                      </DropdownMenuItem>
                    )}

                    {canReject(contestant) && (
                      <DropdownMenuItem onClick={() => onReject?.(contestant)}>
                        <span>Reject</span>
                      </DropdownMenuItem>
                    )}

                    {canDisable(contestant) && (
                      <DropdownMenuItem onClick={() => onDisable?.(contestant)}>
                        <span>Disable</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => onDelete?.(contestant)} className="text-red-600">
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pageInfo && (
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(pageInfo.current - 1) * pageInfo.perPage + 1} to{' '}
            {Math.min(pageInfo.current * pageInfo.perPage, pageInfo.total)} of {pageInfo.total} contestants
          </span>
          <span>{pageInfo.perPage} / page</span>
        </div>
      )}
    </div>
  );
}
