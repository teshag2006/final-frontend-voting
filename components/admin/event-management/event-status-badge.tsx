import { Badge } from '@/components/ui/badge';
import { EventStatus } from '@/types/admin-event';

interface EventStatusBadgeProps {
  status: EventStatus;
}

const statusConfig: Record<EventStatus, { label: string; variant: string; bg: string }> = {
  UPCOMING: {
    label: 'Upcoming',
    variant: 'secondary',
    bg: 'bg-blue-100 text-blue-800',
  },
  ACTIVE: {
    label: 'Active',
    variant: 'default',
    bg: 'bg-green-100 text-green-800',
  },
  CLOSED: {
    label: 'Closed',
    variant: 'secondary',
    bg: 'bg-slate-100 text-slate-800',
  },
  ARCHIVED: {
    label: 'Archived',
    variant: 'outline',
    bg: 'bg-gray-100 text-gray-700',
  },
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge className={`${config.bg} font-semibold`} variant="secondary">
      {config.label}
    </Badge>
  );
}
