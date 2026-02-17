'use client';

import { Badge } from '@/components/ui/badge';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'FLAGGED';
export type FraudRisk = 'Low' | 'Medium' | 'High';

const statusConfig: Record<PaymentStatus, { bg: string; text: string; label: string }> = {
  PENDING: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Pending',
  },
  COMPLETED: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Completed',
  },
  FAILED: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Failed',
  },
  REFUNDED: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    label: 'Refunded',
  },
  FLAGGED: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    label: 'Flagged',
  },
};

const fraudConfig: Record<FraudRisk, { bg: string; text: string }> = {
  Low: {
    bg: 'bg-green-50',
    text: 'text-green-700',
  },
  Medium: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
  },
  High: {
    bg: 'bg-red-50',
    text: 'text-red-700',
  },
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

interface FraudRiskBadgeProps {
  risk: FraudRisk;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge className={`${config.bg} ${config.text} hover:opacity-90`}>
      {config.label}
    </Badge>
  );
}

export function FraudRiskBadge({ risk }: FraudRiskBadgeProps) {
  const config = fraudConfig[risk];
  return (
    <span className={`text-sm font-medium px-2 py-1 rounded ${config.bg} ${config.text}`}>
      {risk}
    </span>
  );
}
