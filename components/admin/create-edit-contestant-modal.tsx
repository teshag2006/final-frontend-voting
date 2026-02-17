'use client';

import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ContestantFormData {
  id?: string;
  name: string;
  bio?: string;
  category: string;
  status?: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'DISABLED';
  avatar?: string;
  galleryImages?: string[];
}

interface CategoryOption {
  id: string;
  name: string;
}

interface CreateEditContestantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContestantFormData) => Promise<void>;
  initialData?: ContestantFormData;
  categories: CategoryOption[];
  isLoading?: boolean;
}

export function CreateEditContestantModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  isLoading = false,
}: CreateEditContestantModalProps) {
  const [formData, setFormData] = useState<ContestantFormData>({
    name: '',
    bio: '',
    category: '',
    status: 'PENDING',
    avatar: undefined,
    galleryImages: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.avatar) {
        setAvatarPreview(initialData.avatar);
      }
    } else {
      setFormData({
        name: '',
        bio: '',
        category: '',
        status: 'PENDING',
        avatar: undefined,
        galleryImages: [],
      });
      setAvatarPreview(null);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In real app, would upload to server
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Contestant' : 'Create Contestant'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image */}
          <div>
            <Label>Profile Image</Label>
            <div className="mt-2 flex items-center gap-4">
              {avatarPreview && (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarPreview(null);
                      setFormData((prev) => ({ ...prev, avatar: undefined }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              disabled={isLoading}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
              disabled={isLoading}
              rows={3}
              placeholder="Enter contestant bio..."
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              disabled={isLoading}
            >
              <SelectTrigger id="category" className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          {/* Status - only show for edit */}
          {initialData && (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'PENDING'}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as ContestantFormData['status'],
                  }))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update Contestant' : 'Create Contestant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
