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
    startDate: '',
    endDate: '',
    status: 'UPCOMING',
  });

  const [errors, setErrors] = useState<Partial<EventFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        description: '',
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
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

          {/* Start & End Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                disabled={isSubmitting || isLoading}
                className={errors.startDate ? 'border-destructive' : ''}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                disabled={isSubmitting || isLoading}
                className={errors.endDate ? 'border-destructive' : ''}
              />
              {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
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
