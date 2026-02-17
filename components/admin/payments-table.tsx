'use client';

import { MoreVertical, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentStatusBadge, FraudRiskBadge, type PaymentStatus, type FraudRisk } from './payment-status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

export interface PaymentData {
  id: string;
  paymentId: string;
  reference: string;
  event: string;
  eventId: string;
  contestant: string;
  amount: number;
  currency: string;
  gateway: string;
  status: PaymentStatus;
  fraudRisk: FraudRisk;
  ipAddress: string;
  anchored: boolean;
  createdAt: string;
}

interface PaymentsTableProps {
  payments: PaymentData[];
  isLoading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (column: string, order: string) => void;
  onViewDetails?: (payment: PaymentData) => void;
  onVerify?: (payment: PaymentData) => void;
  onRefund?: (payment: PaymentData) => void;
  onFlagSuspicious?: (payment: PaymentData) => void;
  onViewLog?: (payment: PaymentData) => void;
}

export function PaymentsTable({
  payments,
  isLoading = false,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  onSortChange,
  onViewDetails,
  onVerify,
  onRefund,
  onFlagSuspicious,
  onViewLog,
}: PaymentsTableProps) {
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
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">No payments found matching your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 text-left font-medium">
              <button
                onClick={() => handleSort('paymentId')}
                className="flex items-center gap-1 hover:text-foreground/80"
                aria-label="Sort by payment ID"
              >
                Payment ID
                <SortIcon column="paymentId" />
              </button>
            </th>
            <th className="px-4 py-3 text-left font-medium">Reference</th>
            <th className="px-4 py-3 text-left font-medium">Event</th>
            <th className="px-4 py-3 text-left font-medium">Contestant</th>
            <th className="px-4 py-3 text-right font-medium">Amount</th>
            <th className="px-4 py-3 text-left font-medium">Gateway</th>
            <th className="px-4 py-3 text-left font-medium">
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 hover:text-foreground/80"
                aria-label="Sort by status"
              >
                Status
                <SortIcon column="status" />
              </button>
            </th>
            <th className="px-4 py-3 text-left font-medium">Fraud Risk</th>
            <th className="px-4 py-3 text-left font-medium">IP Address</th>
            <th className="px-4 py-3 text-left font-medium">Anchored</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b border-border hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 font-mono text-xs">{payment.paymentId}</td>
              <td className="px-4 py-3 font-mono text-xs">{payment.reference}</td>
              <td className="px-4 py-3 text-sm">{payment.event}</td>
              <td className="px-4 py-3 text-sm">{payment.contestant}</td>
              <td className="px-4 py-3 text-right font-medium">{formatCurrency(payment.amount)}</td>
              <td className="px-4 py-3 text-sm">
                <span className="inline-block px-2 py-1 bg-muted rounded text-xs font-medium">
                  {payment.gateway}
                </span>
              </td>
              <td className="px-4 py-3">
                <PaymentStatusBadge status={payment.status} />
              </td>
              <td className="px-4 py-3">
                <FraudRiskBadge risk={payment.fraudRisk} />
              </td>
              <td className="px-4 py-3 font-mono text-xs">{payment.ipAddress}</td>
              <td className="px-4 py-3 text-center">
                <span className="text-sm">{payment.anchored ? 'Yes' : 'No'}</span>
              </td>
              <td className="px-4 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails?.(payment)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {payment.status === 'PENDING' && (
                      <DropdownMenuItem onClick={() => onVerify?.(payment)}>
                        Verify
                      </DropdownMenuItem>
                    )}
                    {payment.status === 'COMPLETED' && (
                      <DropdownMenuItem onClick={() => onRefund?.(payment)}>
                        Refund
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onFlagSuspicious?.(payment)}>
                      Flag as Suspicious
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewLog?.(payment)}>
                      View Gateway Log
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
