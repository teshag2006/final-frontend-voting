'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface LiveStatusBadgeProps {
  status: 'live' | 'pending' | 'closed';
  countdownSeconds?: number;
  lastUpdated?: string;
}

export function LiveStatusBadge({
  status,
  countdownSeconds,
  lastUpdated,
}: LiveStatusBadgeProps) {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds || 0);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    if (status !== 'live' || !countdownSeconds) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [status, countdownSeconds]);

  // Pulse animation for live status
  useEffect(() => {
    if (status !== 'live') return;
    const interval = setInterval(() => setPulse((p) => !p), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const formatCountdown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'closed':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'live':
        return (
          <>
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${pulse ? 'bg-green-600' : 'bg-green-400'}`}></span>
            Live Updating
          </>
        );
      case 'pending':
        return (
          <>
            <span className="inline-block w-2 h-2 rounded-full mr-2 bg-yellow-500"></span>
            Updating Every 30s
          </>
        );
      case 'closed':
        return (
          <>
            <span className="inline-block w-2 h-2 rounded-full mr-2 bg-slate-500"></span>
            Voting Closed
          </>
        );
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <Badge variant="outline" className={getStatusColor()}>
        {getStatusText()}
      </Badge>
      
      {status === 'live' && countdownSeconds && (
        <div className="text-sm font-semibold text-slate-700">
          Ends in: <span className="text-base font-mono text-blue-600">{formatCountdown(timeLeft)}</span>
        </div>
      )}

      {lastUpdated && (
        <div className="text-xs text-slate-500">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
