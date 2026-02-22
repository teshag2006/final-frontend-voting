'use client';

import { type ChangeEvent, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ContestantProfileComposerData } from '@/lib/contestant-runtime-store';

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
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const isValidYouTubeUrl = (raw: string) => {
    try {
      const url = new URL(raw);
      const host = url.hostname.toLowerCase().replace(/^www\./, '');
      if (host === 'youtu.be') return Boolean(url.pathname.replace('/', '').trim());
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (url.pathname === '/watch') return Boolean(url.searchParams.get('v'));
        if (url.pathname.startsWith('/shorts/')) return Boolean(url.pathname.split('/')[2]);
        if (url.pathname.startsWith('/embed/')) return Boolean(url.pathname.split('/')[2]);
      }
      return false;
    } catch {
      return false;
    }
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
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

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        setLocalError('Could not read selected photo.');
        return;
      }
      setLocalError('');
      onChange({ ...value, photoUrl: result });
    };
    reader.onerror = () => setLocalError('Could not read selected photo.');
    reader.readAsDataURL(file);
  };

  const handleSaveClick = async () => {
    if (value.youtube.trim() && !isValidYouTubeUrl(value.youtube.trim())) {
      setLocalError('Enter a valid YouTube URL (youtube.com or youtu.be).');
      return;
    }
    setLocalError('');
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
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Photo
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
        <input value={value.instagram} onChange={(e) => onChange({ ...value, instagram: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="Instagram handle (no URL)" />
        <input value={value.tiktok} onChange={(e) => onChange({ ...value, tiktok: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="TikTok handle (no URL)" />
        <input
          value={value.youtube}
          onChange={(e) => onChange({ ...value, youtube: e.target.value })}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm md:col-span-2"
          placeholder="YouTube video URL (https://www.youtube.com/watch?v=...)"
        />
        <p className="text-xs text-slate-500 md:col-span-2">
          Only YouTube video URLs are accepted for intro video to reduce phishing risk.
        </p>
      </div>
      {localError ? <p className="mt-2 text-sm text-red-700">{localError}</p> : null}
      <Button className="mt-3" onClick={() => void handleSaveClick()}>
        Save Profile
      </Button>
    </section>
  );
}
