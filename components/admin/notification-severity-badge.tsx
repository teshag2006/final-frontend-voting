'use client';

import { Badge } from '@/components/ui/badge';
import { type NotificationSeverity } from '@/types/notifications';
import { AlertTriangle, AlertCircle, AlertOctagon, Info } from 'lucide-react';

interface NotificationSeverityBadgeProps {
  severity: NotificationSeverity;
  className?: string;
}

export function NotificationSeverityBadge({ severity, className }: NotificationSeverityBadgeProps) {
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
      variant: 'outline' as const,
      icon: AlertTriangle,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    CRITICAL: {
      variant: 'destructive' as const,
      icon: AlertOctagon,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
  };

  const style = styles[severity];
  const Icon = style.icon;

  return (
    <Badge variant={style.variant} className={`${style.bgColor} gap-1.5 ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${style.color}`} />
      <span>{severity}</span>
    </Badge>
  );
}
