'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminEvent, EventStatus } from '@/types/admin-event';
import { X } from 'lucide-react';

interface CreateEditEventModalProps {
  isOpen: boolean;
  event?: AdminEvent | null;
  onClose: () => void;
  onSave: (eventData: Partial<AdminEvent>) => void;
}

export function CreateEditEventModal({
  isOpen,
  event,
  onClose,
  onSave,
}: CreateEditEventModalProps) {
  const [formData, setFormData] = useState<Partial<AdminEvent>>({
    name: '',
    description: '',
    status: 'UPCOMING',
    startDate: '',
    endDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        description: event.description,
        status: event.status,
        startDate: event.startDate,
        endDate: event.endDate,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'UPCOMING',
        startDate: '',
        endDate: '',
      });
    }
    setErrors({});
  }, [event, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Event name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start >= end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as EventStatus }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogDescription>
            {event
              ? 'Update event details and configuration'
              : 'Set up a new voting event with basic information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Event Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Anderson Idol 2024"
              value={formData.name || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the event and its purpose"
              value={formData.description || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-medium">
              Start Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.startDate}
              className={errors.startDate ? 'border-destructive' : ''}
            />
            {errors.startDate && (
              <p className="text-xs text-destructive mt-1">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-medium">
              End Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.endDate}
              className={errors.endDate ? 'border-destructive' : ''}
            />
            {errors.endDate && (
              <p className="text-xs text-destructive mt-1">{errors.endDate}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select value={formData.status || 'UPCOMING'} onValueChange={handleStatusChange}>
              <SelectTrigger id="status" disabled={isSubmitting}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Save Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
