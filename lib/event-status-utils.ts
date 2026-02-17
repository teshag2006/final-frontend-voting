import type { Event } from '@/types/event';

export type EventStatus = 'LIVE' | 'UPCOMING' | 'CLOSED' | 'PAUSED' | 'ARCHIVED' | 'CANCELLED';

/**
 * Allowed transitions between event statuses
 * Maps from current status to allowed next statuses
 */
const ALLOWED_STATUS_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  UPCOMING: ['LIVE', 'CANCELLED'],
  LIVE: ['PAUSED', 'CLOSED', 'CANCELLED'],
  PAUSED: ['LIVE', 'CLOSED', 'CANCELLED'],
  CLOSED: ['ARCHIVED', 'CANCELLED'],
  ARCHIVED: ['CANCELLED'],
  CANCELLED: [],
};

/**
 * Check if a status transition is allowed
 */
export function isValidStatusTransition(
  currentStatus: EventStatus,
  newStatus: EventStatus
): boolean {
  const allowedStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  return allowedStatuses?.includes(newStatus) ?? false;
}

/**
 * Get the reason why a transition is not allowed (for error messages)
 */
export function getTransitionError(
  currentStatus: EventStatus,
  newStatus: EventStatus
): string {
  if (currentStatus === newStatus) {
    return `Event is already in ${currentStatus} status`;
  }

  const allowedStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus];
  if (!allowedStatuses?.includes(newStatus)) {
    return `Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedStatuses.join(', ') || 'None'}`;
  }

  return 'Transition not allowed';
}

/**
 * Get the next automatic status for an event based on dates
 */
export function getAutoStatusBasedOnDates(event: Event): EventStatus | null {
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  // If we're after end date, event should be CLOSED or ARCHIVED
  if (now > endDate) {
    return 'CLOSED';
  }

  // If we're between start and end, should be LIVE
  if (now >= startDate && now <= endDate) {
    return 'LIVE';
  }

  // If we're before start date, should be UPCOMING
  if (now < startDate) {
    return 'UPCOMING';
  }

  return null;
}

/**
 * Check if an event should allow voting
 */
export function canVoteInEvent(event: Event): boolean {
  const status = event.status as EventStatus;
  return status === 'LIVE' || status === 'active';
}

/**
 * Check if an event should show countdown
 */
export function shouldShowCountdown(event: Event): boolean {
  const status = event.status as EventStatus;
  return status === 'UPCOMING' || status === 'coming_soon' || status === 'LIVE';
}

/**
 * Get event status label for display
 */
export function getStatusLabel(status: string): string {
  const labelMap: Record<string, string> = {
    LIVE: 'Live',
    active: 'Live',
    UPCOMING: 'Upcoming',
    coming_soon: 'Upcoming',
    CLOSED: 'Closed',
    PAUSED: 'Paused',
    ARCHIVED: 'Archived',
    CANCELLED: 'Cancelled',
    cancelled: 'Cancelled',
  };

  return labelMap[status] || 'Unknown';
}

/**
 * Get event status color for UI display
 */
export function getStatusColor(
  status: string
): 'green' | 'blue' | 'orange' | 'slate' | 'red' {
  switch (status) {
    case 'LIVE':
    case 'active':
      return 'green';
    case 'UPCOMING':
    case 'coming_soon':
      return 'blue';
    case 'CLOSED':
      return 'orange';
    case 'PAUSED':
      return 'yellow';
    case 'ARCHIVED':
      return 'slate';
    case 'CANCELLED':
    case 'cancelled':
      return 'red';
    default:
      return 'slate';
  }
}

/**
 * Get event status badge classes
 */
export function getStatusBadgeClasses(status: string): string {
  const colorMap: Record<string, string> = {
    LIVE: 'bg-green-100 text-green-800 border-green-300',
    active: 'bg-green-100 text-green-800 border-green-300',
    UPCOMING: 'bg-blue-100 text-blue-800 border-blue-300',
    coming_soon: 'bg-blue-100 text-blue-800 border-blue-300',
    CLOSED: 'bg-orange-100 text-orange-800 border-orange-300',
    PAUSED: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    ARCHIVED: 'bg-slate-100 text-slate-800 border-slate-300',
    CANCELLED: 'bg-red-100 text-red-800 border-red-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };

  return colorMap[status] || 'bg-slate-100 text-slate-800 border-slate-300';
}

/**
 * Calculate time remaining for an event
 */
export function getTimeRemaining(
  targetDate: string | Date
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
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

/**
 * Format time remaining as readable string
 */
export function formatTimeRemaining(targetDate: string | Date): string {
  const remaining = getTimeRemaining(targetDate);

  if (remaining.isExpired) {
    return 'Time expired';
  }

  if (remaining.days > 0) {
    return `${remaining.days}d ${remaining.hours}h`;
  }

  if (remaining.hours > 0) {
    return `${remaining.hours}h ${remaining.minutes}m`;
  }

  if (remaining.minutes > 0) {
    return `${remaining.minutes}m ${remaining.seconds}s`;
  }

  return `${remaining.seconds}s`;
}
