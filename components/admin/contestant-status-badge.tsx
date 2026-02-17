'use client';

export type ContestantStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'DISABLED';

interface ContestantStatusBadgeProps {
  status: ContestantStatus;
  className?: string;
}

const statusConfig: Record<ContestantStatus, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'PENDING' },
  APPROVED: { bg: 'bg-green-50', text: 'text-green-700', label: 'APPROVED' },
  REJECTED: { bg: 'bg-red-50', text: 'text-red-700', label: 'REJECTED' },
  ACTIVE: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'ACTIVE' },
  DISABLED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'DISABLED' },
};

export function ContestantStatusBadge({ status, className = '' }: ContestantStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
      role="status"
      aria-label={`Contestant status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
