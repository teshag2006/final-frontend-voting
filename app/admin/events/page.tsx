'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import Link from 'next/link';
import { EventsTable, EventData } from '@/components/admin/events-table';
import { EventFiltersNav } from '@/components/admin/event-filters-nav';
import { CreateEditEventModal, EventFormData } from '@/components/admin/create-edit-event-modal';
import {
  generateMockEvents,
  filterEventsByStatus,
  sortEvents,
} from '@/lib/events-management-mock';

type FilterTab = 'all' | 'active' | 'upcoming' | 'closed';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'status'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);

  // Initialize mock data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvents(generateMockEvents());
      setIsTableLoading(false);
    }, 500);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = filterEventsByStatus(events, activeTab);
    result = sortEvents(result, sortBy, sortOrder);
    setFilteredEvents(result);
  }, [events, activeTab, sortBy, sortOrder]);

  const handleCreateEvent = () => {
    setSelectedEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: EventData) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (event: EventData) => {
    // Show confirmation and delete
    if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
    }
  };

  const handleChangeStatus = (event: EventData, newStatus: string) => {
    // Show confirmation for critical status changes
    if (newStatus === 'CLOSED') {
      if (!confirm(`Close event "${event.name}"? Voting will be disabled.`)) {
        return;
      }
    }

    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id
          ? { ...e, status: newStatus as EventData['status'] }
          : e
      )
    );
  };

  const handleModalSubmit = async (data: EventFormData) => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (selectedEvent) {
      // Edit existing event
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id
            ? {
                ...e,
                name: data.name,
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate,
                status: data.status,
              }
            : e
        )
      );
    } else {
      // Create new event
      const newEvent: EventData = {
        id: Date.now().toString(),
        ...data,
        totalVotes: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
      };
      setEvents((prev) => [newEvent, ...prev]);
    }

    setIsLoading(false);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy as 'name' | 'created' | 'status');
    setSortOrder(newSortOrder as 'asc' | 'desc');
  };

  return (
    <ProtectedRouteWrapper
      requiredRole="admin"
      fallbackUrl="/events"
    >
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted transition-colors"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Event Management</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Event Management
                  </h1>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full sm:w-auto"
                size="lg"
              >
                <Link href="/admin/sponsors">Manage Sponsors</Link>
              </Button>

              <Button
                onClick={handleCreateEvent}
                className="gap-2 w-full sm:w-auto"
                size="lg"
              >
                <Plus className="h-5 w-5" />
                <span>Create Event</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters Section */}
          <div className="mb-6">
            <EventFiltersNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Events Summary */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} of {events.length} events
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              <span>Sort by: Created At</span>
            </div>
          </div>

          {/* Events Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <EventsTable
              events={filteredEvents}
              isLoading={isTableLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onChangeStatus={handleChangeStatus}
            />
          </div>

          {/* Pagination Info */}
          {filteredEvents.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing 1 to {Math.min(10, filteredEvents.length)} of {filteredEvents.length} events
              </p>
            </div>
          )}
        </main>

        {/* Create/Edit Event Modal */}
        <CreateEditEventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(undefined);
          }}
          onSubmit={handleModalSubmit}
          initialData={selectedEvent ? { ...selectedEvent, description: selectedEvent.description ?? '' } : undefined}
          isLoading={isLoading}
        />
      </div>
    </ProtectedRouteWrapper>
  );
}

