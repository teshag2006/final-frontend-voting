'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { EventStatus, Event } from '@/types/event';

interface EventContextType {
  eventId: string;
  slug: string;
  status: EventStatus;
  seasonYear: number;
  startDate: Date;
  endDate: Date;
  title: string;
  isLive: boolean;
  isUpcoming: boolean;
  isClosed: boolean;
  isPaused: boolean;
  isArchived: boolean;
  name: string;
  description?: string;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

interface EventProviderProps {
  children: ReactNode;
  value?: EventContextType;
  initialEvent?: Event;
}

export function EventProvider({ children, value, initialEvent }: EventProviderProps) {
  const contextValue = useMemo(() => {
    if (value) return value;

    if (initialEvent) {
      return {
        eventId: initialEvent.id,
        slug: initialEvent.slug,
        status: (initialEvent.status as EventStatus) || 'UPCOMING',
        seasonYear: initialEvent.season_year || new Date().getFullYear(),
        startDate: new Date(initialEvent.start_date),
        endDate: new Date(initialEvent.end_date),
        title: initialEvent.name,
        name: initialEvent.name,
        description: initialEvent.description,
        isLive: initialEvent.status === 'LIVE' || initialEvent.status === 'active',
        isUpcoming: initialEvent.status === 'UPCOMING' || initialEvent.status === 'coming_soon',
        isClosed: initialEvent.status === 'CLOSED',
        isPaused: initialEvent.status === 'PAUSED',
        isArchived: initialEvent.status === 'ARCHIVED',
      };
    }

    throw new Error('EventProvider requires either value or initialEvent prop');
  }, [value, initialEvent]);

  return (
    <EventContext.Provider value={contextValue}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent(): EventContextType {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within EventProvider');
  }
  return context;
}

export const getEventStatusClass = (status: EventStatus): string => {
  const statusMap: Record<EventStatus, string> = {
    LIVE: 'bg-green-50 text-green-900 border-green-200',
    UPCOMING: 'bg-blue-50 text-blue-900 border-blue-200',
    CLOSED: 'bg-gray-50 text-gray-900 border-gray-200',
    PAUSED: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    ARCHIVED: 'bg-slate-50 text-slate-900 border-slate-200',
    active: 'bg-green-50 text-green-900 border-green-200',
    coming_soon: 'bg-blue-50 text-blue-900 border-blue-200',
    cancelled: 'bg-red-50 text-red-900 border-red-200',
  };
  return statusMap[status] || 'bg-gray-50 text-gray-900 border-gray-200';
};

export const getEventStatusLabel = (status: EventStatus): string => {
  const labelMap: Record<EventStatus, string> = {
    LIVE: 'Live',
    UPCOMING: 'Upcoming',
    CLOSED: 'Closed',
    PAUSED: 'Paused',
    ARCHIVED: 'Archived',
    active: 'Live',
    coming_soon: 'Upcoming',
    cancelled: 'Cancelled',
  };
  return labelMap[status] || 'Unknown';
};
