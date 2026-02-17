'use client';

import { cn } from '@/lib/utils';

export type AdminStatusType = 'ACTIVE' | 'DISABLED' | 'LOCKED';

interface AdminStatusBadgeProps {
  status: AdminStatusType;
  className?: string;
}

const statusConfig: Record<AdminStatusType, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
  DISABLED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Disabled' },
  LOCKED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Locked' },
};

export function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className={cn('inline-flex items-center rounded-md px-3 py-1.5 text-sm font-semibold', config.bg, config.text, className)}>
      {config.label}
    </div>
  );
}
