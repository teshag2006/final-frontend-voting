'use client';

import { Badge } from '@/components/ui/badge';
import { type RiskLevel } from '@/types/audit-logs';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface AuditRiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function AuditRiskBadge({ level, className }: AuditRiskBadgeProps) {
  const styles = {
    LOW: {
      variant: 'outline' as const,
      icon: Info,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    MEDIUM: {
      variant: 'outline' as const,
      icon: AlertCircle,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    HIGH: {
      variant: 'destructive' as const,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
  };

  const style = styles[level];
  const Icon = style.icon;

  return (
    <Badge variant={style.variant} className={`${style.bgColor} gap-1.5 ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${style.color}`} />
      <span>{level}</span>
    </Badge>
  );
}
