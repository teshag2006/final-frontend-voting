'use client';

import { Badge } from '@/components/ui/badge';
import { Circle } from 'lucide-react';

interface CacheStatusBadgeProps {
  status: 'CONNECTED' | 'DISCONNECTED';
  className?: string;
}

export function CacheStatusBadge({ status, className = '' }: CacheStatusBadgeProps) {
  const isConnected = status === 'CONNECTED';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Circle
        size={8}
        className={`fill-current ${isConnected ? 'text-green-500' : 'text-red-500'}`}
        aria-hidden="true"
      />
      <Badge variant={isConnected ? 'default' : 'destructive'}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </Badge>
    </div>
  );
}
