import { Badge } from '@/components/ui/badge';

type CaseStatus = 'OPEN' | 'REVIEWED' | 'BLOCKED' | 'OVERRIDDEN';

const statusConfig: Record<CaseStatus, { label: string; className: string }> = {
  OPEN: {
    label: 'Open',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  REVIEWED: {
    label: 'Reviewed',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  },
  BLOCKED: {
    label: 'Blocked',
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
  OVERRIDDEN: {
    label: 'Overridden',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  },
};

interface FraudCaseStatusBadgeProps {
  status: CaseStatus;
  compact?: boolean;
}

export function FraudCaseStatusBadge({ status, compact = false }: FraudCaseStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={`${config.className} font-semibold`}>
      {compact ? status[0] : config.label}
    </Badge>
  );
}
