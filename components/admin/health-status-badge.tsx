import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, AlertTriangle } from 'lucide-react';
import type { SystemStatus, ServiceStatus } from '@/types/health-monitor';

interface HealthStatusBadgeProps {
  status: SystemStatus | ServiceStatus;
  size?: 'sm' | 'md';
}

export function HealthStatusBadge({ status, size = 'md' }: HealthStatusBadgeProps) {
  const baseClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm';

  if (status === 'UP' || status === 'HEALTHY') {
    return (
      <Badge className={`${baseClass} bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1.5 w-fit`}>
        <Check className="h-3.5 w-3.5" />
        {status === 'UP' ? 'Up' : 'Healthy'}
      </Badge>
    );
  }

  if (status === 'DEGRADED') {
    return (
      <Badge className={`${baseClass} bg-amber-100 text-amber-800 hover:bg-amber-200 flex items-center gap-1.5 w-fit`}>
        <AlertCircle className="h-3.5 w-3.5" />
        Degraded
      </Badge>
    );
  }

  if (status === 'DOWN' || status === 'CRITICAL') {
    return (
      <Badge className={`${baseClass} bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1.5 w-fit`}>
        <AlertTriangle className="h-3.5 w-3.5" />
        {status === 'DOWN' ? 'Down' : 'Critical'}
      </Badge>
    );
  }

  return null;
}
