'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventManagementHeaderProps {
  onCreateEvent?: () => void;
}

export function EventManagementHeader({ onCreateEvent }: EventManagementHeaderProps) {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Event Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create, configure, and manage voting events
            </p>
          </div>

          <Button
            onClick={onCreateEvent}
            className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            <span>Create Event</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
