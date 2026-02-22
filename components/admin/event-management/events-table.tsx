'use client';

import { useState } from 'react';
import { ConfirmationDialog } from './confirmation-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Edit2, MoreVertical, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { CreateEditEventModal } from './create-edit-event-modal';
import { EventStatusBadge } from './event-status-badge';
import { AdminEvent, EventStatus } from '@/types/admin-event';
import { formatDate, formatCurrency } from '@/lib/utils';

interface EventsTableProps {
  initialEvents: AdminEvent[];
}

type FilterStatus = 'all' | EventStatus;

export function EventsTable({ initialEvents }: EventsTableProps) {
  const [events, setEvents] = useState(initialEvents);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AdminEvent | null>(null);
  const [sortBy, setSortBy] = useState<'createdAt' | 'name'>('createdAt');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'status-change';
    eventId?: string;
    newStatus?: EventStatus;
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: 'delete',
    title: '',
    description: '',
  });

  // Filter events based on selected status
  const filteredEvents = events.filter(
    (event) => filterStatus === 'all' || event.status === filterStatus
  );

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.name.localeCompare(b.name);
  });

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: AdminEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = (eventData: Partial<AdminEvent>) => {
    if (editingEvent) {
      // Update existing event
      setEvents(
        events.map((e) =>
          e.id === editingEvent.id
            ? { ...e, ...eventData, updatedAt: new Date().toISOString() }
            : e
        )
      );
    } else {
      // Create new event
      const newEvent: AdminEvent = {
        id: `event-${Date.now()}`,
        name: eventData.name || '',
        description: eventData.description || '',
        status: (eventData.status || 'UPCOMING') as EventStatus,
        registrationStart: eventData.registrationStart || '',
        registrationEnd: eventData.registrationEnd || '',
        votingStart: eventData.votingStart || '',
        votingEnd: eventData.votingEnd || '',
        startDate: eventData.startDate || '',
        endDate: eventData.endDate || '',
        totalVotes: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEvents([newEvent, ...events]);
    }
    handleModalClose();
  };

  const handleDeleteEvent = (eventId: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      eventId,
      title: 'Delete Event',
      description: 'Are you sure you want to delete this event? This action cannot be undone and all associated data will be permanently removed.',
    });
  };

  const handleConfirmDelete = async () => {
    if (confirmDialog.eventId) {
      setEvents(events.filter((e) => e.id !== confirmDialog.eventId));
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  const handleChangeStatus = (eventId: string, newStatus: EventStatus) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const statusTransitions: Record<EventStatus, string> = {
      UPCOMING: 'activate this event and enable voting',
      ACTIVE: 'close this event and disable voting',
      CLOSED: 'archive this event',
      ARCHIVED: 'unarchive this event',
    };

    setConfirmDialog({
      isOpen: true,
      type: 'status-change',
      eventId,
      newStatus,
      title: `Change Event Status to ${newStatus}`,
      description: `You are about to ${statusTransitions[newStatus]}. This action will have system-wide implications.`,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (confirmDialog.eventId && confirmDialog.newStatus) {
      setEvents(
        events.map((e) =>
          e.id === confirmDialog.eventId
            ? { ...e, status: confirmDialog.newStatus!, updatedAt: new Date().toISOString() }
            : e
        )
      );
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Filter Tabs and Sort */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              {(['all', 'UPCOMING', 'ACTIVE', 'CLOSED'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="whitespace-nowrap"
                >
                  {status === 'all' ? 'All' : status}
                </Button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Sort by: Created At (Newest)</SelectItem>
                <SelectItem value="name">Sort by: Event Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Events Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Event Name</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Start Date</TableHead>
                  <TableHead className="font-semibold">End Date</TableHead>
                  <TableHead className="font-semibold text-right">Total Votes</TableHead>
                  <TableHead className="font-semibold text-right">Revenue</TableHead>
                  <TableHead className="font-semibold">Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No events found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedEvents.map((event) => (
                    <TableRow key={event.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>
                        <EventStatusBadge status={event.status} />
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(event.startDate)}</TableCell>
                      <TableCell className="text-sm">{formatDate(event.endDate)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {event.totalVotes.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCurrency(event.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(event.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                              onClick={() => handleEditEvent(event)}
                              className="gap-2 cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                              <span>Edit Event</span>
                            </DropdownMenuItem>

                            {event.status === 'UPCOMING' && (
                              <DropdownMenuItem
                                onClick={() => handleChangeStatus(event.id, 'ACTIVE')}
                                className="gap-2 cursor-pointer"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Activate Event</span>
                              </DropdownMenuItem>
                            )}

                            {event.status === 'ACTIVE' && (
                              <DropdownMenuItem
                                onClick={() => handleChangeStatus(event.id, 'CLOSED')}
                                className="gap-2 cursor-pointer"
                              >
                                <XCircle className="h-4 w-4 text-amber-600" />
                                <span>Close Event</span>
                              </DropdownMenuItem>
                            )}

                            {event.status === 'CLOSED' && (
                              <DropdownMenuItem
                                onClick={() => handleChangeStatus(event.id, 'ARCHIVED')}
                                className="gap-2 cursor-pointer"
                              >
                                <span>Archive Event</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleDeleteEvent(event.id)}
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          {sortedEvents.length > 0 && (
            <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
              Showing {sortedEvents.length} of {sortedEvents.length} events
            </div>
          )}
        </Card>
      </div>

      {/* Create/Edit Event Modal */}
      <CreateEditEventModal
        isOpen={isModalOpen}
        event={editingEvent}
        onClose={handleModalClose}
        onSave={handleSaveEvent}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.type === 'delete' ? 'Delete' : 'Confirm'}
        cancelText="Cancel"
        isDangerous={confirmDialog.type === 'delete'}
        onConfirm={
          confirmDialog.type === 'delete'
            ? handleConfirmDelete
            : handleConfirmStatusChange
        }
        onCancel={() =>
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
      />
    </>
  );
}
