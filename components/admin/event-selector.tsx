'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export interface EventOption {
  id: string;
  name: string;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
}

interface EventSelectorProps {
  events: EventOption[];
  value?: string;
  onChange: (eventId: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function EventSelector({
  events,
  value,
  onChange,
  placeholder = 'Select an event',
  isLoading = false,
  disabled = false,
  showLabel = true,
  className = '',
}: EventSelectorProps) {
  return (
    <div className={className}>
      {showLabel && <Label htmlFor="event-select" className="block mb-2">Event</Label>}
      <Select value={value || ''} onValueChange={onChange} disabled={disabled || isLoading}>
        <SelectTrigger
          id="event-select"
          className="w-full"
          aria-label="Select event"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">No events available</div>
          ) : (
            events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
