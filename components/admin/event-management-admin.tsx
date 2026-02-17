'use client';

import { useState, useCallback } from 'react';
import { VirtualTable } from './virtual-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventData {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'live' | 'ended' | 'archived';
  startDate: string;
  endDate: string;
  totalVotes: number;
  totalRevenue: number;
  category: string;
  createdAt: string;
}

interface EventManagementAdminProps {
  events: EventData[];
  onAdd?: (event: Omit<EventData, 'id' | 'totalVotes' | 'totalRevenue' | 'createdAt'>) => void;
  onEdit?: (event: EventData) => void;
  onDelete?: (eventId: string) => void;
  onView?: (event: EventData) => void;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  scheduled: 'bg-blue-500',
  live: 'bg-green-500',
  ended: 'bg-orange-500',
  archived: 'bg-gray-400',
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  live: 'Live',
  ended: 'Ended',
  archived: 'Archived',
};

export function EventManagementAdmin({
  events,
  onAdd,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
}: EventManagementAdminProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft' as const,
    startDate: '',
    endDate: '',
    category: '',
  });

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      status: 'draft',
      startDate: '',
      endDate: '',
      category: '',
    });
    setEditingEvent(null);
  }, []);

  const handleOpenDialog = useCallback((event?: EventData) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        name: event.name,
        description: '',
        status: event.status,
        startDate: event.startDate,
        endDate: event.endDate,
        category: event.category,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  }, [resetForm]);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(() => {
    if (editingEvent) {
      onEdit?.({
        ...editingEvent,
        ...formData,
      });
    } else {
      onAdd?.(formData as any);
    }
    handleCloseDialog();
  }, [editingEvent, formData, onAdd, onEdit, handleCloseDialog]);

  const columns = [
    {
      key: 'name' as const,
      label: 'Event Name',
      width: 200,
      sortable: true,
      filterable: false,
    },
    {
      key: 'status' as const,
      label: 'Status',
      width: 120,
      sortable: true,
      filterable: true,
      render: (value: string) => (
        <Badge className={cn('text-white', statusColors[value])}>
          {statusLabels[value] || value}
        </Badge>
      ),
    },
    {
      key: 'startDate' as const,
      label: 'Start Date',
      width: 150,
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'endDate' as const,
      label: 'End Date',
      width: 150,
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'category' as const,
      label: 'Category',
      width: 120,
      sortable: true,
      filterable: true,
    },
    {
      key: 'totalVotes' as const,
      label: 'Total Votes',
      width: 120,
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'totalRevenue' as const,
      label: 'Revenue',
      width: 120,
      sortable: true,
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      key: 'createdAt' as const,
      label: 'Created',
      width: 150,
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const handleRowClick = useCallback((row: EventData) => {
    onView?.(row);
  }, [onView]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Event Management</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" /> New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Event Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter event name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Enter category"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit}>{editingEvent ? 'Update' : 'Create'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      {/* Virtual Table */}
      <VirtualTable<EventData>
        columns={columns}
        data={events}
        isLoading={isLoading}
        emptyMessage="No events found. Create one to get started."
        searchableColumns={['name', 'category']}
        onRowClick={handleRowClick}
      />
    </div>
  );
}
