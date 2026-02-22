'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface EventFormData {
  id?: string;
  name: string;
  description: string;
  registrationStart: string;
  registrationEnd: string;
  votingStart: string;
  votingEnd: string;
  startDate: string;
  endDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
}

interface CreateEditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => Promise<void>;
  initialData?: EventFormData;
  isLoading?: boolean;
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
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: CreateEditEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    registrationStart: '',
    registrationEnd: '',
    votingStart: '',
    votingEnd: '',
    startDate: '',
    endDate: '',
    status: 'UPCOMING',
  });

  const [errors, setErrors] = useState<Partial<EventFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        registrationStart: toDateTimeLocal(initialData.registrationStart),
        registrationEnd: toDateTimeLocal(initialData.registrationEnd),
        votingStart: toDateTimeLocal(initialData.votingStart || initialData.startDate),
        votingEnd: toDateTimeLocal(initialData.votingEnd || initialData.endDate),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        registrationStart: '',
        registrationEnd: '',
        votingStart: '',
        votingEnd: '',
        startDate: '',
        endDate: '',
        status: 'UPCOMING',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.name.trim()) {
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        startDate: formData.votingStart,
        endDate: formData.votingEnd,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof EventFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const title = initialData ? 'Edit Event' : 'Create Event';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="event-name" className="text-sm font-medium">
              Event Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="event-name"
              placeholder="e.g., Anderson Idol 2024"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isSubmitting || isLoading}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="event-desc" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="event-desc"
              placeholder="Annual singing competition"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isSubmitting || isLoading}
              rows={3}
            />
          </div>

          {/* Registration Window */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="registration-start" className="text-sm font-medium">
                Registration Start <span className="text-destructive">*</span>
              </Label>
              <Input
                id="registration-start"
                type="datetime-local"
                value={formData.registrationStart}
                onChange={(e) => handleChange('registrationStart', e.target.value)}
                disabled={isSubmitting || isLoading}
                className={errors.registrationStart ? 'border-destructive' : ''}
              />
              {errors.registrationStart && (
                <p className="text-xs text-destructive">{errors.registrationStart}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration-end" className="text-sm font-medium">
                Registration End <span className="text-destructive">*</span>
              </Label>
              <Input
                id="registration-end"
                type="datetime-local"
                value={formData.registrationEnd}
                onChange={(e) => handleChange('registrationEnd', e.target.value)}
                disabled={isSubmitting || isLoading}
                className={errors.registrationEnd ? 'border-destructive' : ''}
              />
              {errors.registrationEnd && <p className="text-xs text-destructive">{errors.registrationEnd}</p>}
            </div>
          </div>

          {/* Voting Window */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="voting-start" className="text-sm font-medium">
                Voting Start <span className="text-destructive">*</span>
              </Label>
              <Input
                id="voting-start"
                type="datetime-local"
                value={formData.votingStart}
                onChange={(e) => handleChange('votingStart', e.target.value)}
                disabled={isSubmitting || isLoading}
                className={errors.votingStart ? 'border-destructive' : ''}
              />
              {errors.votingStart && (
                <p className="text-xs text-destructive">{errors.votingStart}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="voting-end" className="text-sm font-medium">
                Voting End (Date & Hour) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="voting-end"
                type="datetime-local"
                value={formData.votingEnd}
                onChange={(e) => handleChange('votingEnd', e.target.value)}
                disabled={isSubmitting || isLoading}
                className={errors.votingEnd ? 'border-destructive' : ''}
              />
              {errors.votingEnd && <p className="text-xs text-destructive">{errors.votingEnd}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="event-status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleChange('status', value as 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED')
              }
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger id="event-status">
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
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Saving...' : 'Save Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
