// @ts-nocheck
'use client';

import { useState, useCallback } from 'react';
import { VirtualTable } from './virtual-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContestantData {
  id: string;
  name: string;
  photoUrl?: string;
  voteCount: number;
  rank: number;
  category: string;
  status: 'active' | 'suspended' | 'inactive';
  eventId: string;
  createdAt: string;
  lastVoteAt: string;
}

interface ContestantManagementAdminProps {
  contestants: ContestantData[];
  onAdd?: (contestant: Omit<ContestantData, 'id' | 'voteCount' | 'rank' | 'createdAt' | 'lastVoteAt'>) => void;
  onEdit?: (contestant: ContestantData) => void;
  onDelete?: (contestantId: string) => void;
  onBulkUpload?: (file: File) => void;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  suspended: 'bg-red-500',
  inactive: 'bg-gray-500',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  suspended: 'Suspended',
  inactive: 'Inactive',
};

export function ContestantManagementAdmin({
  contestants,
  onAdd,
  onEdit,
  onDelete,
  onBulkUpload,
  isLoading = false,
}: ContestantManagementAdminProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContestant, setEditingContestant] = useState<ContestantData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    eventId: '',
    status: 'active' as const,
    photoUrl: '',
  });

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      category: '',
      eventId: '',
      status: 'active',
      photoUrl: '',
    });
    setEditingContestant(null);
  }, []);

  const handleOpenDialog = useCallback((contestant?: ContestantData) => {
    if (contestant) {
      setEditingContestant(contestant);
      setFormData({
        name: contestant.name,
        category: contestant.category,
        eventId: contestant.eventId,
        status: contestant.status,
        photoUrl: contestant.photoUrl || '',
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
    if (editingContestant) {
      onEdit?.({
        ...editingContestant,
        ...formData,
      });
    } else {
      onAdd?.(formData as any);
    }
    handleCloseDialog();
  }, [editingContestant, formData, onAdd, onEdit, handleCloseDialog]);

  const columns = [
    {
      key: 'name' as const,
      label: 'Name',
      width: 180,
      sortable: true,
      filterable: false,
      render: (_: any, row: ContestantData) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.photoUrl} />
            <AvatarFallback>{row.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="truncate">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'rank' as const,
      label: 'Rank',
      width: 80,
      sortable: true,
      render: (value: number) => `#${value}`,
    },
    {
      key: 'voteCount' as const,
      label: 'Votes',
      width: 120,
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'category' as const,
      label: 'Category',
      width: 150,
      sortable: true,
      filterable: true,
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
      key: 'lastVoteAt' as const,
      label: 'Last Vote',
      width: 150,
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Contestant Management</CardTitle>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => handleOpenDialog()}>
                  <Upload className="h-4 w-4 mr-2" /> Bulk Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Upload Contestants</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={(e) => e.target.files?.[0] && onBulkUpload?.(e.target.files[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: CSV, XLSX. Required columns: name, category, eventId
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" /> New Contestant
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingContestant ? 'Edit Contestant' : 'Add Contestant'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter contestant name"
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
                    <Label htmlFor="eventId">Event ID</Label>
                    <Input
                      id="eventId"
                      value={formData.eventId}
                      onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                      placeholder="Enter event ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="photoUrl">Photo URL</Label>
                    <Input
                      id="photoUrl"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      placeholder="https://..."
                      type="url"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>{editingContestant ? 'Update' : 'Add'}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Virtual Table */}
      <VirtualTable<ContestantData>
        columns={columns}
        data={contestants}
        isLoading={isLoading}
        emptyMessage="No contestants found."
        searchableColumns={['name', 'category']}
      />
    </div>
  );
}


