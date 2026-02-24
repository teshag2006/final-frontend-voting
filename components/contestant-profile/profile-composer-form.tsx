'use client';

import { type ChangeEvent, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ContestantProfileComposerData } from '@/lib/contestant-runtime-store';
import { sanitizePlainText } from '@/lib/security/frontend-security';
import { uploadMediaFile } from '@/lib/client/upload-media';

export function ProfileComposerForm({
  value,
  galleryItems,
  onChange,
  onRemoveGallery,
  onSave,
}: {
  value: ContestantProfileComposerData;
  galleryItems: Array<{ id: string; url: string; label: string }>;
  onChange: (next: ContestantProfileComposerData) => void;
  onRemoveGallery: (mediaId: string) => Promise<void>;
  onSave: () => Promise<void>;
}) {
  const [localError, setLocalError] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const normalizeHandle = (raw: string) => {
    let next = raw.trim();
    next = next.replace(/^https?:\/\/(www\.)?(instagram\.com\/|tiktok\.com\/@|youtube\.com\/@|x\.com\/|facebook\.com\/|snapchat\.com\/add\/)/i, '');
    next = next.replace(/^@/, '');
    next = next.split(/[/?#]/)[0] || '';
    return next;
  };
  const isSafeHandle = (raw: string) => /^[A-Za-z0-9._]{1,50}$/.test(raw);

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalError('Please upload an image file.');
      event.target.value = '';
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError('Photo must be 5MB or less.');
      event.target.value = '';
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const uploadedUrl = await uploadMediaFile(file, 'contestant-media/profile');
      setLocalError('');
      onChange({ ...value, photoUrl: uploadedUrl });
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Could not upload selected photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveClick = async () => {
    setLocalError('');
    const nextProfile: ContestantProfileComposerData = {
      ...value,
      displayName: sanitizePlainText(value.displayName, 80),
      category: sanitizePlainText(value.category, 80),
      location: sanitizePlainText(value.location, 120),
      bio: sanitizePlainText(value.bio, 500),
      instagram: value.instagram ? `@${normalizeHandle(value.instagram)}` : '',
      tiktok: value.tiktok ? `@${normalizeHandle(value.tiktok)}` : '',
      youtubeHandle: normalizeHandle(value.youtubeHandle),
      x: normalizeHandle(value.x),
      facebook: normalizeHandle(value.facebook),
      snapchat: normalizeHandle(value.snapchat),
    };

    const handlesToCheck = [
      nextProfile.instagram.replace(/^@/, ''),
      nextProfile.tiktok.replace(/^@/, ''),
      nextProfile.youtubeHandle,
      nextProfile.x,
      nextProfile.facebook,
      nextProfile.snapchat,
    ].filter(Boolean);

    if (handlesToCheck.some((item) => !isSafeHandle(item))) {
      setLocalError('Usernames may only contain letters, numbers, dots, and underscores.');
      return;
    }

    onChange(nextProfile);
    await onSave();
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Profile Composer</h2>
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm font-medium text-slate-900">Profile Photo</p>
        <div className="mt-2 flex items-center gap-3">
          {value.photoUrl ? (
            <div className="relative">
              <img src={value.photoUrl} alt="Contestant profile preview" className="h-20 w-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => onChange({ ...value, photoUrl: '' })}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white"
                aria-label="Remove profile photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-slate-300 bg-white text-xs text-slate-500">
              No photo
            </div>
          )}
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handlePhotoChange(event)} />
          <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()} disabled={isUploadingPhoto}>
            <Upload className="mr-2 h-4 w-4" />
            {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
          </Button>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm font-medium text-slate-900">Gallery Photos</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {galleryItems.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-md border border-slate-200 bg-white">
              <img src={item.url} alt={item.label || 'Gallery photo'} className="h-24 w-full object-cover" />
              <button
                type="button"
                onClick={() => void onRemoveGallery(item.id)}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                aria-label="Remove gallery photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {galleryItems.length === 0 ? (
            <div className="col-span-2 rounded-md border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-500 sm:col-span-3">
              No gallery photos yet.
            </div>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Upload new gallery photos from the dedicated Gallery menu.
        </p>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input value={value.displayName} onChange={(e) => onChange({ ...value, displayName: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="Display name" />
        <input value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="Category" />
        <input value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm md:col-span-2" placeholder="Location" />
        <textarea value={value.bio} onChange={(e) => onChange({ ...value, bio: e.target.value })} className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2" placeholder="Bio" />
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
          <p className="text-sm font-medium text-slate-900">Social Media Usernames</p>
          <p className="mt-1 text-xs text-slate-500">
            Enter only username. Domain is fixed to prevent scam links.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs text-slate-600">Instagram</span>
              <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white">
                <span className="shrink-0 border-r border-slate-200 px-3 text-xs text-slate-500">https://instagram.com/</span>
                <input
                  value={normalizeHandle(value.instagram)}
                  onChange={(e) => {
                    const handle = normalizeHandle(e.target.value);
                    onChange({ ...value, instagram: handle ? `@${handle}` : '' });
                  }}
                  className="h-full w-full rounded-r-md px-3 text-sm outline-none"
                  placeholder="username"
                />
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-600">YouTube</span>
              <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white">
                <span className="shrink-0 border-r border-slate-200 px-3 text-xs text-slate-500">https://youtube.com/@</span>
                <input
                  value={normalizeHandle(value.youtubeHandle)}
                  onChange={(e) => onChange({ ...value, youtubeHandle: normalizeHandle(e.target.value) })}
                  className="h-full w-full rounded-r-md px-3 text-sm outline-none"
                  placeholder="username"
                />
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-600">TikTok</span>
              <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white">
                <span className="shrink-0 border-r border-slate-200 px-3 text-xs text-slate-500">https://tiktok.com/@</span>
                <input
                  value={normalizeHandle(value.tiktok)}
                  onChange={(e) => {
                    const handle = normalizeHandle(e.target.value);
                    onChange({ ...value, tiktok: handle ? `@${handle}` : '' });
                  }}
                  className="h-full w-full rounded-r-md px-3 text-sm outline-none"
                  placeholder="username"
                />
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-600">X</span>
              <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white">
                <span className="shrink-0 border-r border-slate-200 px-3 text-xs text-slate-500">https://x.com/</span>
                <input
                  value={normalizeHandle(value.x)}
                  onChange={(e) => onChange({ ...value, x: normalizeHandle(e.target.value) })}
                  className="h-full w-full rounded-r-md px-3 text-sm outline-none"
                  placeholder="username"
                />
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-600">Facebook</span>
              <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white">
                <span className="shrink-0 border-r border-slate-200 px-3 text-xs text-slate-500">https://facebook.com/</span>
                <input
                  value={normalizeHandle(value.facebook)}
                  onChange={(e) => onChange({ ...value, facebook: normalizeHandle(e.target.value) })}
                  className="h-full w-full rounded-r-md px-3 text-sm outline-none"
                  placeholder="username"
                />
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-600">Snapchat</span>
              <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white">
                <span className="shrink-0 border-r border-slate-200 px-3 text-xs text-slate-500">https://snapchat.com/add/</span>
                <input
                  value={normalizeHandle(value.snapchat)}
                  onChange={(e) => onChange({ ...value, snapchat: normalizeHandle(e.target.value) })}
                  className="h-full w-full rounded-r-md px-3 text-sm outline-none"
                  placeholder="username"
                />
              </div>
            </label>
          </div>
        </div>
      </div>
      {localError ? <p className="mt-2 text-sm text-red-700">{localError}</p> : null}
      <Button className="mt-3" onClick={() => void handleSaveClick()}>
        Save Profile
      </Button>
    </section>
  );
}
