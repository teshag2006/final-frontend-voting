'use client';

import { EventStatus } from '@/types/event';
import { AlertCircle, Clock, CheckCircle2, Pause } from 'lucide-react';
import { getEventStatusLabel } from '@/context/EventContext';

interface EventStatusBannerProps {
  status: EventStatus;
  startDate?: Date;
  endDate?: Date;
  showVotingDisabled?: boolean;
}

export function EventStatusBanner({
  status,
  startDate,
  endDate,
  showVotingDisabled = false,
}: EventStatusBannerProps) {
  const statusLabel = getEventStatusLabel(status);
  const isLive = status === 'LIVE' || status === 'active';
  const isUpcoming = status === 'UPCOMING' || status === 'coming_soon';
  const isClosed = status === 'CLOSED' || status === 'cancelled';
  const isPaused = status === 'PAUSED';
  const isArchived = status === 'ARCHIVED';

  if (isLive && !showVotingDisabled) return null;

  let bgColor = 'bg-gray-50 border-gray-200';
  let textColor = 'text-gray-900';
  let Icon = AlertCircle;
  let message = 'Event status unknown';

  if (isLive) {
    bgColor = 'bg-green-50 border-green-200';
    textColor = 'text-green-900';
    Icon = CheckCircle2;
    message = 'Voting is currently active for this event';
  } else if (isUpcoming) {
    bgColor = 'bg-blue-50 border-blue-200';
    textColor = 'text-blue-900';
    Icon = Clock;
    message = 'Voting will start when this event goes live';
  } else if (isClosed) {
    bgColor = 'bg-gray-50 border-gray-200';
    textColor = 'text-gray-900';
    Icon = AlertCircle;
    message = 'Voting has ended for this event. View results instead';
  } else if (isPaused) {
    bgColor = 'bg-yellow-50 border-yellow-200';
    textColor = 'text-yellow-900';
    Icon = Pause;
    message = 'Voting is temporarily paused for this event';
  } else if (isArchived) {
    bgColor = 'bg-slate-50 border-slate-200';
    textColor = 'text-slate-900';
    Icon = AlertCircle;
    message = 'This event is archived. View results in the archive';
  }

  return (
    <div className={`border rounded-lg p-4 ${bgColor}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${textColor}`} />
        <div className="flex-1">
          <p className={`font-semibold ${textColor}`}>{statusLabel}</p>
          <p className={`text-sm ${textColor} opacity-75 mt-1`}>{message}</p>
        </div>
      </div>
    </div>
  );
}
