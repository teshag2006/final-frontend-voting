'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface EventCountdownProps {
  startDate: string;
  endDate?: string;
  eventStatus: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeRemaining(targetDate: string): TimeRemaining {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const distance = target - now;

  if (distance <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    isExpired: false,
  };
}

export function EventCountdown({
  startDate,
  endDate,
  eventStatus,
}: EventCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    // Calculate initial time
    const targetDate = eventStatus === 'UPCOMING' ? startDate : endDate || startDate;
    setTimeRemaining(calculateTimeRemaining(targetDate));

    // Update every second
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate, endDate, eventStatus]);

  if (!timeRemaining) {
    return null;
  }

  const countdownLabel =
    eventStatus === 'UPCOMING' ? 'Voting starts in' : 'Voting ends in';
  const timeUnitColor = eventStatus === 'UPCOMING' ? 'text-blue-600' : 'text-red-600';

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <Clock className={`h-5 w-5 ${timeUnitColor}`} />
        <span className="whitespace-nowrap font-medium text-slate-900">
          {countdownLabel}:
        </span>
      </div>
      <div className="mt-2 flex gap-2 font-mono font-bold">
        <span className={`${timeUnitColor} bg-white px-2 py-1 rounded min-w-12 text-center`}>
          {String(timeRemaining.days).padStart(2, '0')}d
        </span>
        <span className={`${timeUnitColor} bg-white px-2 py-1 rounded min-w-12 text-center`}>
          {String(timeRemaining.hours).padStart(2, '0')}h
        </span>
        <span className={`${timeUnitColor} bg-white px-2 py-1 rounded min-w-12 text-center`}>
          {String(timeRemaining.minutes).padStart(2, '0')}m
        </span>
        <span className={`${timeUnitColor} bg-white px-2 py-1 rounded min-w-12 text-center`}>
          {String(timeRemaining.seconds).padStart(2, '0')}s
        </span>
      </div>
    </div>
  );
}
