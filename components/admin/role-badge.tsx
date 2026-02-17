'use client';

import { cn } from '@/lib/utils';

export type RoleType = 'SUPER_ADMIN' | 'ADMIN' | 'FINANCE_ADMIN' | 'FRAUD_ADMIN' | 'MEDIA_ADMIN' | 'VIEW_ONLY_ADMIN';

interface RoleBadgeProps {
  role: RoleType;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
  className?: string;
}

const roleConfig: Record<RoleType, { bg: string; text: string; label: string; description: string }> = {
  SUPER_ADMIN: { bg: 'bg-red-100', text: 'text-red-800', label: 'Super Admin', description: 'Full system control' },
  ADMIN: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Admin', description: 'Admin access' },
  FINANCE_ADMIN: { bg: 'bg-green-100', text: 'text-green-800', label: 'Finance Admin', description: 'Finance management' },
  FRAUD_ADMIN: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Fraud Admin', description: 'Fraud monitoring' },
  MEDIA_ADMIN: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Media Admin', description: 'Media management' },
  VIEW_ONLY_ADMIN: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'View Only', description: 'Read-only access' },
};

export function RoleBadge({ role, size = 'md', variant = 'default', className }: RoleBadgeProps) {
  const config = roleConfig[role];

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md font-semibold whitespace-nowrap',
        sizeClasses[size],
        variant === 'default' && `${config.bg} ${config.text}`,
        variant === 'outline' && `border-2 border-current ${config.text}`,
        className
      )}
      title={config.description}
    >
      {config.label}
    </div>
  );
}
