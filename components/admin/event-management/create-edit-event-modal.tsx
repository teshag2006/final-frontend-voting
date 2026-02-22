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

function toDateTimeLocal(value?: string): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
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
    registrationStart: '',
    registrationEnd: '',
    votingStart: '',
    votingEnd: '',
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
        registrationStart: toDateTimeLocal(event.registrationStart),
        registrationEnd: toDateTimeLocal(event.registrationEnd),
        votingStart: toDateTimeLocal(event.votingStart || event.startDate),
        votingEnd: toDateTimeLocal(event.votingEnd || event.endDate),
        startDate: event.startDate,
        endDate: event.endDate,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'UPCOMING',
        registrationStart: '',
        registrationEnd: '',
        votingStart: '',
        votingEnd: '',
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

    if (!formData.registrationStart) {
      newErrors.registrationStart = 'Registration start is required';
    }

    if (!formData.registrationEnd) {
      newErrors.registrationEnd = 'Registration end is required';
    }

    if (!formData.votingStart) {
      newErrors.votingStart = 'Voting start is required';
    }

    if (!formData.votingEnd) {
      newErrors.votingEnd = 'Voting end is required';
    }

    if (formData.registrationStart && formData.registrationEnd) {
      const start = new Date(formData.registrationStart);
      const end = new Date(formData.registrationEnd);
      if (start >= end) {
        newErrors.registrationEnd = 'Registration end must be after registration start';
      }
    }

    if (formData.votingStart && formData.votingEnd) {
      const start = new Date(formData.votingStart);
      const end = new Date(formData.votingEnd);
      if (start >= end) {
        newErrors.votingEnd = 'Voting end must be after voting start';
      }
    }

    if (formData.registrationEnd && formData.votingStart) {
      const registrationEnd = new Date(formData.registrationEnd);
      const votingStart = new Date(formData.votingStart);
      if (registrationEnd > votingStart) {
        newErrors.votingStart = 'Voting start must be after registration end';
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
      onSave({
        ...formData,
        startDate: formData.votingStart,
        endDate: formData.votingEnd,
      });
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

          {/* Registration Start */}
          <div className="space-y-2">
            <Label htmlFor="registrationStart" className="text-sm font-medium">
              Registration Start <span className="text-destructive">*</span>
            </Label>
            <Input
              id="registrationStart"
              name="registrationStart"
              type="datetime-local"
              value={formData.registrationStart || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.registrationStart}
              className={errors.registrationStart ? 'border-destructive' : ''}
            />
            {errors.registrationStart && (
              <p className="text-xs text-destructive mt-1">{errors.registrationStart}</p>
            )}
          </div>

          {/* Registration End */}
          <div className="space-y-2">
            <Label htmlFor="registrationEnd" className="text-sm font-medium">
              Registration End <span className="text-destructive">*</span>
            </Label>
            <Input
              id="registrationEnd"
              name="registrationEnd"
              type="datetime-local"
              value={formData.registrationEnd || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.registrationEnd}
              className={errors.registrationEnd ? 'border-destructive' : ''}
            />
            {errors.registrationEnd && (
              <p className="text-xs text-destructive mt-1">{errors.registrationEnd}</p>
            )}
          </div>

          {/* Voting Start */}
          <div className="space-y-2">
            <Label htmlFor="votingStart" className="text-sm font-medium">
              Voting Start <span className="text-destructive">*</span>
            </Label>
            <Input
              id="votingStart"
              name="votingStart"
              type="datetime-local"
              value={formData.votingStart || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.votingStart}
              className={errors.votingStart ? 'border-destructive' : ''}
            />
            {errors.votingStart && (
              <p className="text-xs text-destructive mt-1">{errors.votingStart}</p>
            )}
          </div>

          {/* Voting End */}
          <div className="space-y-2">
            <Label htmlFor="votingEnd" className="text-sm font-medium">
              Voting End (Date & Hour) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="votingEnd"
              name="votingEnd"
              type="datetime-local"
              value={formData.votingEnd || ''}
              onChange={handleChange}
              disabled={isSubmitting}
              aria-invalid={!!errors.votingEnd}
              className={errors.votingEnd ? 'border-destructive' : ''}
            />
            {errors.votingEnd && (
              <p className="text-xs text-destructive mt-1">{errors.votingEnd}</p>
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
