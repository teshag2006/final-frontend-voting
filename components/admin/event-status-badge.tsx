'use client';

import { Badge } from '@/components/ui/badge';

type EventStatusType = 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

interface EventStatusBadgeProps {
  status: EventStatusType;
}

const statusConfig: Record<EventStatusType, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  UPCOMING: {
    label: 'Upcoming',
    variant: 'outline',
  },
  ACTIVE: {
    label: 'Active',
    variant: 'default',
  },
  CLOSED: {
    label: 'Closed',
    variant: 'secondary',
  },
  ARCHIVED: {
    label: 'Archived',
    variant: 'destructive',
  },
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className="text-xs font-semibold">
      {config.label}
    </Badge>
  );
}
