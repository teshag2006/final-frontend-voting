'use client';

import { Badge } from '@/components/ui/badge';
import { AnchorStatus } from '@/types/blockchain-monitor';

interface BlockchainStatusBadgeProps {
  status: AnchorStatus;
  className?: string;
}

export function BlockchainStatusBadge({ status, className = '' }: BlockchainStatusBadgeProps) {
  const statusConfig = {
    PENDING: {
      variant: 'secondary' as const,
      label: 'Pending',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    },
    CONFIRMED: {
      variant: 'default' as const,
      label: 'Confirmed',
      color: 'bg-green-100 text-green-800 border-green-300',
    },
    FAILED: {
      variant: 'destructive' as const,
      label: 'Failed',
      color: 'bg-red-100 text-red-800 border-red-300',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={`${config.color} ${className}`}>
      {config.label}
    </Badge>
  );
}
