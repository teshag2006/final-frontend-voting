'use client';

import { Badge } from '@/components/ui/badge';

type CategoryStatus = 'ACTIVE' | 'INACTIVE';

const statusConfig: Record<CategoryStatus, { bg: string; text: string; label: string }> = {
  ACTIVE: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    label: 'Active',
  },
  INACTIVE: {
    bg: 'bg-slate-100 dark:bg-slate-900/30',
    text: 'text-slate-700 dark:text-slate-400',
    label: 'Inactive',
  },
};

interface CategoryStatusBadgeProps {
  status: CategoryStatus;
  className?: string;
}

export function CategoryStatusBadge({ status, className = '' }: CategoryStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
}
