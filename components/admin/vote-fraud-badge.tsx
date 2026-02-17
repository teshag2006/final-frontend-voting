'use client';

import { Badge } from '@/components/ui/badge';
import { VoteStatus } from '@/types/vote-monitoring';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

interface VoteFraudBadgeProps {
  status: VoteStatus;
  fraudScore: number;
  className?: string;
}

export function VoteFraudBadge({ status, fraudScore, className = '' }: VoteFraudBadgeProps) {
  const statusConfig = {
    VALID: {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle2,
      label: 'Valid',
    },
    FLAGGED: {
      color: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: AlertTriangle,
      label: 'Flagged',
    },
    BLOCKED: {
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: XCircle,
      label: 'Blocked',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="outline" className={`${config.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
      <span className="text-xs font-medium text-slate-600">{fraudScore.toFixed(1)}/100</span>
    </div>
  );
}
