'use client';

import { AlertTriangle, AlertCircle, CheckCircle, XCircle, Zap, Loader } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { SystemEventsResponse, SystemEvent } from '@/types/admin-overview';

interface SystemFeedProps {
  data: SystemEventsResponse;
  onLoadMore?: () => void;
}

function getEventIcon(type: SystemEvent['type']) {
  switch (type) {
    case 'fraud_alert':
      return <AlertTriangle className="h-4 w-4" />;
    case 'webhook_failure':
      return <XCircle className="h-4 w-4" />;
    case 'velocity_violation':
      return <Zap className="h-4 w-4" />;
    case 'payment_failure':
      return <AlertCircle className="h-4 w-4" />;
    case 'trust_score_drop':
      return <AlertCircle className="h-4 w-4" />;
    case 'system_error':
      return <XCircle className="h-4 w-4" />;
    default:
      return <CheckCircle className="h-4 w-4" />;
  }
}

function getSeverityColor(severity: SystemEvent['severity']) {
  switch (severity) {
    case 'critical':
      return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
    case 'high':
      return 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    case 'medium':
      return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'low':
      return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    default:
      return 'bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
  }
}

function getTypeLabel(type: SystemEvent['type']) {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function SystemFeed({ data, onLoadMore }: SystemFeedProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadMore = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onLoadMore?.();
    setIsLoading(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">System Events</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time monitoring of platform alerts and activities
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-green-700 dark:text-green-400">Live</span>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {data.events.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium">All systems operational</p>
            <p className="text-sm text-muted-foreground mt-1">No recent alerts or events</p>
          </div>
        ) : (
          data.events.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-lg border flex gap-4 transition-all hover:shadow-sm ${getSeverityColor(event.severity)}`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 pt-1">{getEventIcon(event.type)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs opacity-90 mt-1">{event.description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs whitespace-nowrap flex-shrink-0 ${getSeverityColor(event.severity)}`}
                  >
                    {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
                  </Badge>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-2 mt-3 text-xs opacity-75">
                  <span className="px-2 py-1 rounded bg-current/10">
                    {getTypeLabel(event.type)}
                  </span>
                  <span className="px-2 py-1 rounded bg-current/10">
                    {new Date(event.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true,
                    })}
                  </span>
                  {event.related?.eventName && (
                    <span className="px-2 py-1 rounded bg-current/10">{event.related.eventName}</span>
                  )}
                  {event.related?.deviceId && (
                    <span className="px-2 py-1 rounded bg-current/10 font-mono">
                      {event.related.deviceId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More / Pagination */}
      {data.pagination.hasMore && (
        <div className="mt-4 pt-4 border-t border-border flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>Load More Events</>
            )}
          </Button>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Showing {data.events.length} of {data.pagination.total} events
        </p>
      </div>
    </Card>
  );
}
