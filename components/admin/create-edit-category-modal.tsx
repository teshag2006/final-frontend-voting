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

export interface CategoryFormData {
  id?: string;
  name: string;
  eventId: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface EventOption {
  id: string;
  name: string;
  status: 'ACTIVE' | 'UPCOMING' | 'CLOSED';
}

interface CreateEditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  initialData?: CategoryFormData;
  initialEventId?: string;
  availableEvents: EventOption[];
  isLoading?: boolean;
}

export function CreateEditCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialEventId,
  availableEvents,
  isLoading = false,
}: CreateEditCategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    eventId: initialEventId || '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        eventId: initialEventId || '',
        status: 'ACTIVE',
      });
    }
    setErrors({});
  }, [initialData, initialEventId, isOpen]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.eventId) {
      newErrors.eventId = 'Event selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        eventId: initialEventId || '',
        status: 'ACTIVE',
      });
      setErrors({});
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="category-name">
              Category Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="category-name"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g., Solo Vocalists"
              disabled={isSubmitting || isLoading}
              aria-describedby={errors.name ? 'category-name-error' : undefined}
            />
            {errors.name && (
              <p id="category-name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          {/* Event Selection */}
          <div className="space-y-2">
            <Label htmlFor="event-select">
              Event <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.eventId}
              onValueChange={(value) => {
                setFormData((prev) => ({ ...prev, eventId: value }));
                if (errors.eventId) setErrors((prev) => ({ ...prev, eventId: undefined }));
              }}
              disabled={isSubmitting || isLoading || !!initialData}
            >
              <SelectTrigger
                id="event-select"
                aria-describedby={errors.eventId ? 'event-select-error' : undefined}
              >
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {availableEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventId && (
              <p id="event-select-error" className="text-sm text-destructive">
                {errors.eventId}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status-select">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as 'ACTIVE' | 'INACTIVE',
                }))
              }
              disabled={isSubmitting || isLoading}
            >
              <SelectTrigger id="status-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="gap-2"
            >
              {isSubmitting && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              <span>
                {initialData ? 'Update Category' : 'Create Category'}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
