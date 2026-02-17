'use client';

import { useState } from 'react';
import type { VoterProfile } from '@/types/voter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ProfileFormProps {
  profile: VoterProfile;
  onSave?: (fullName: string) => Promise<void>;
}

export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(fullName);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(profile.fullName);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">Profile Information</h2>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          {isEditing ? (
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="mb-3"
            />
          ) : (
            <p className="text-foreground py-2">{fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <div className="flex items-center gap-2">
            <p className="text-foreground py-2">{profile.email}</p>
            {profile.googleLinked && (
              <Badge variant="secondary" className="text-xs">
                Google Linked
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {profile.googleLinked
              ? 'Email cannot be changed when linked with Google'
              : 'Your primary email address'}
          </p>
        </div>

        {/* Account Created */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Account Created
          </label>
          <p className="text-foreground py-2">{formatDate(profile.createdAt)}</p>
        </div>

        {/* Phone Number */}
        {profile.phoneNumber && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <p className="text-foreground py-2">{profile.phoneNumber}</p>
              {profile.phoneVerified && (
                <Badge variant="default" className="text-xs bg-green-600">
                  Verified
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isSaving || fullName.trim() === profile.fullName}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="w-full"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
