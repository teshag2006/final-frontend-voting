'use client';

import { ReactNode } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { canVoteInEvent } from '@/lib/event-status-utils';

interface EventStatusGuardProps {
  status: string;
  eventSlug: string;
  children: ReactNode;
  allowedStatuses?: string[];
  redirectTo?: string;
}

export function EventStatusGuard({
  status,
  eventSlug,
  children,
  allowedStatuses = ['LIVE'],
  redirectTo,
}: EventStatusGuardProps) {
  // Check if current status is allowed
  if (allowedStatuses.includes(status)) {
    return <>{children}</>;
  }

  // Handle different status scenarios
  if (status === 'UPCOMING') {
    return (
      <div className="flex flex-col gap-4">
        <Alert className="border-amber-200 bg-amber-50">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            This event is not yet open for voting. Voting will begin when the event starts.
          </AlertDescription>
        </Alert>
        {children}
      </div>
    );
  }

  if (status === 'CLOSED') {
    return (
      <div className="space-y-4">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Voting for this event has closed. View the final results instead.
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/events/${eventSlug}/results`}>View Results</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'PAUSED') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Voting for this event is temporarily paused. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'ARCHIVED') {
    return (
      <div className="space-y-4">
        <Alert className="border-slate-200 bg-slate-50">
          <AlertCircle className="h-4 w-4 text-slate-600" />
          <AlertDescription className="text-slate-800">
            This is an archived event. You can view the results but cannot vote.
          </AlertDescription>
        </Alert>
        <Button variant="outline" asChild>
          <Link href={`/events/${eventSlug}/results`}>View Final Results</Link>
        </Button>
      </div>
    );
  }

  if (status === 'CANCELLED') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          This event has been cancelled and is no longer available.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
