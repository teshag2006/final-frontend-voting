'use client';

import { useState } from 'react';
import { EventCard } from '@/components/events/event-card';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/event';
import { Filter } from 'lucide-react';

interface ArchiveFilterClientProps {
  events: Event[];
}

export function ArchiveFilterClient({ events }: ArchiveFilterClientProps) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const years = [...new Set(events.map((e) => e.season_year || 2024))].sort((a, b) => b - a);
  const filteredEvents = selectedYear 
    ? events.filter((e) => (e.season_year || 2024) === selectedYear)
    : events;

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <span className="text-gray-700 font-medium">Filter by Year:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedYear === null ? 'default' : 'outline'}
            onClick={() => setSelectedYear(null)}
            className="text-sm"
          >
            All Years
          </Button>
          {years.map((year) => (
            <Button
              key={year}
              variant={selectedYear === year ? 'default' : 'outline'}
              onClick={() => setSelectedYear(year)}
              className="text-sm"
            >
              {year}
            </Button>
          ))}
        </div>
      </div>

      {/* Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No archived events found for the selected year.</p>
        </div>
      )}
    </div>
  );
}
