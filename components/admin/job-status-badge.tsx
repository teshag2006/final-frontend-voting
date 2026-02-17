import { Badge } from '@/components/ui/badge';
import { JobStatus, JobPriority } from '@/types/queue-job';

interface JobStatusBadgeProps {
  status: JobStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function JobStatusBadge({
  status,
  size = 'md',
  className = '',
}: JobStatusBadgeProps) {
  const statusConfig: Record<
    JobStatus,
    {
      label: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
      icon?: string;
    }
  > = {
    WAITING: {
      label: 'Waiting',
      variant: 'secondary',
      icon: '⏳',
    },
    ACTIVE: {
      label: 'Active',
      variant: 'default',
      icon: '▶',
    },
    COMPLETED: {
      label: 'Completed',
      variant: 'secondary',
      icon: '✓',
    },
    FAILED: {
      label: 'Failed',
      variant: 'destructive',
      icon: '✕',
    },
    DELAYED: {
      label: 'Delayed',
      variant: 'secondary',
      icon: '⏸',
    },
  };

  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-0.5';

  return (
    <Badge variant={config.variant} className={`${sizeClass} ${className} gap-1`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </Badge>
  );
}

interface JobPriorityBadgeProps {
  priority: JobPriority;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function JobPriorityBadge({
  priority,
  size = 'md',
  className = '',
}: JobPriorityBadgeProps) {
  const priorityConfig: Record<
    JobPriority,
    {
      label: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
      dotColor: string;
    }
  > = {
    LOW: {
      label: 'Low',
      variant: 'outline',
      dotColor: 'bg-gray-400',
    },
    NORMAL: {
      label: 'Normal',
      variant: 'secondary',
      dotColor: 'bg-blue-400',
    },
    HIGH: {
      label: 'High',
      variant: 'secondary',
      dotColor: 'bg-orange-400',
    },
    CRITICAL: {
      label: 'Critical',
      variant: 'destructive',
      dotColor: 'bg-red-500',
    },
  };

  const config = priorityConfig[priority];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-0.5';

  return (
    <Badge variant={config.variant} className={`${sizeClass} ${className} gap-1`}>
      <span className={`h-2 w-2 rounded-full ${config.dotColor}`}></span>
      <span>{config.label}</span>
    </Badge>
  );
}
