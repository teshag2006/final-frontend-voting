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
  const parseLocation = (raw: string) => {
    const parts = raw
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) return { country: '', region: '', city: '' };
    if (parts.length === 1) return { country: '', region: '', city: parts[0] };
    if (parts.length === 2) return { country: parts[1], region: '', city: parts[0] };
    return { country: parts[0], region: parts[1], city: parts.slice(2).join(', ') };
  };
  const composeLocation = (location: { country: string; region: string; city: string }) =>
    [location.country, location.region, location.city].filter(Boolean).join(', ');
  const updateLocationField = (field: 'country' | 'region' | 'city', fieldValue: string) => {
    const current = parseLocation(value.location);
    const next = { ...current, [field]: fieldValue };
    onChange({ ...value, location: composeLocation(next) });
  };
  const locationParts = parseLocation(value.location);
  type SocialPlatformKey = 'instagram' | 'youtube' | 'tiktok' | 'x' | 'facebook' | 'snapchat';
  type SocialMetricKey = 'followers' | 'views' | 'likes' | 'subscribers';
  const parseMetricValue = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    const numeric = Number(trimmed);
    if (!Number.isFinite(numeric) || numeric < 0) return undefined;
    return Math.floor(numeric);
  };
  const sanitizeMetricValue = (value: unknown) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) return undefined;
    return Math.floor(numeric);
  };
  const updateSocialMetric = (platform: SocialPlatformKey, metric: SocialMetricKey, rawValue: string) => {
    const currentStats = value.socialStats || {};
    const platformStats = currentStats[platform] || {};
    onChange({
      ...value,
      socialStats: {
        ...currentStats,
        [platform]: {
          ...platformStats,
          [metric]: parseMetricValue(rawValue),
        },
      },
    });
  };
  const socialSections: Array<{
    key: SocialPlatformKey;
    label: string;
    prefix: string;
    username: string;
    onUsernameChange: (raw: string) => void;
    metrics: SocialMetricKey[];
  }> = [
    {
      key: 'instagram',
      label: 'Instagram',
      prefix: 'https://instagram.com/',
      username: normalizeHandle(value.instagram),
      onUsernameChange: (raw) => {
        const handle = normalizeHandle(raw);
        onChange({ ...value, instagram: handle ? `@${handle}` : '' });
      },
      metrics: ['followers', 'views', 'likes'],
    },
    {
      key: 'youtube',
      label: 'YouTube',
      prefix: 'https://youtube.com/@',
      username: normalizeHandle(value.youtubeHandle),
      onUsernameChange: (raw) => onChange({ ...value, youtubeHandle: normalizeHandle(raw) }),
      metrics: ['subscribers', 'views', 'likes'],
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      prefix: 'https://tiktok.com/@',
      username: normalizeHandle(value.tiktok),
      onUsernameChange: (raw) => {
        const handle = normalizeHandle(raw);
        onChange({ ...value, tiktok: handle ? `@${handle}` : '' });
      },
      metrics: ['followers', 'views', 'likes'],
    },
    {
      key: 'x',
      label: 'X',
      prefix: 'https://x.com/',
      username: normalizeHandle(value.x),
      onUsernameChange: (raw) => onChange({ ...value, x: normalizeHandle(raw) }),
      metrics: ['followers', 'likes'],
    },
    {
      key: 'facebook',
      label: 'Facebook',
      prefix: 'https://facebook.com/',
      username: normalizeHandle(value.facebook),
      onUsernameChange: (raw) => onChange({ ...value, facebook: normalizeHandle(raw) }),
      metrics: ['followers', 'views', 'likes'],
    },
    {
      key: 'snapchat',
      label: 'Snapchat',
      prefix: 'https://snapchat.com/add/',
      username: normalizeHandle(value.snapchat),
      onUsernameChange: (raw) => onChange({ ...value, snapchat: normalizeHandle(raw) }),
      metrics: ['subscribers', 'views'],
    },
  ];

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
      socialStats: {
        instagram: {
          followers: sanitizeMetricValue(value.socialStats?.instagram?.followers),
          views: sanitizeMetricValue(value.socialStats?.instagram?.views),
          likes: sanitizeMetricValue(value.socialStats?.instagram?.likes),
        },
        youtube: {
          subscribers: sanitizeMetricValue(value.socialStats?.youtube?.subscribers),
          views: sanitizeMetricValue(value.socialStats?.youtube?.views),
          likes: sanitizeMetricValue(value.socialStats?.youtube?.likes),
        },
        tiktok: {
          followers: sanitizeMetricValue(value.socialStats?.tiktok?.followers),
          views: sanitizeMetricValue(value.socialStats?.tiktok?.views),
          likes: sanitizeMetricValue(value.socialStats?.tiktok?.likes),
        },
        x: {
          followers: sanitizeMetricValue(value.socialStats?.x?.followers),
          likes: sanitizeMetricValue(value.socialStats?.x?.likes),
        },
        facebook: {
          followers: sanitizeMetricValue(value.socialStats?.facebook?.followers),
          views: sanitizeMetricValue(value.socialStats?.facebook?.views),
          likes: sanitizeMetricValue(value.socialStats?.facebook?.likes),
        },
        snapchat: {
          subscribers: sanitizeMetricValue(value.socialStats?.snapchat?.subscribers),
          views: sanitizeMetricValue(value.socialStats?.snapchat?.views),
        },
      },
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
        <p className="mt-1 text-xs text-slate-500">Recommended: 1200x1600 px (3:4 portrait), JPG/WebP.</p>
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
        <p className="mt-1 text-xs text-slate-500">
          Recommended gallery size: 1200x1500 px (4:5 portrait).
        </p>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input value={value.displayName} onChange={(e) => onChange({ ...value, displayName: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="Display name" />
        <input value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="Category" />
        <div className="space-y-2 md:col-span-2">
          <p className="text-xs font-medium text-slate-700">Location</p>
          <div className="grid gap-2 md:grid-cols-3">
            <input
              value={locationParts.country}
              onChange={(e) => updateLocationField('country', e.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              placeholder="Country"
            />
            <input
              value={locationParts.region}
              onChange={(e) => updateLocationField('region', e.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              placeholder="Region"
            />
            <input
              value={locationParts.city}
              onChange={(e) => updateLocationField('city', e.target.value)}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              placeholder="City"
            />
          </div>
        </div>
        <textarea value={value.bio} onChange={(e) => onChange({ ...value, bio: e.target.value })} className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2" placeholder="Bio" />
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
          <p className="text-sm font-medium text-slate-900">Social Media Usernames</p>
          <p className="mt-1 text-xs text-slate-500">
            Enter only username. Domain is fixed to prevent scam links. Add only metrics that apply to each platform.
          </p>
          <div className="mt-3 space-y-3">
            {socialSections.map((section) => (
              <div key={section.key} className="rounded-lg border border-slate-200 bg-white p-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-700">{section.label}</span>
                  <div className="flex h-10 items-center rounded-md border border-slate-300 bg-white">
                    <span className="shrink-0 border-r border-slate-200 px-3 text-xs text-slate-500">{section.prefix}</span>
                    <input
                      value={section.username}
                      onChange={(e) => section.onUsernameChange(e.target.value)}
                      className="h-full w-full rounded-r-md px-3 text-sm outline-none"
                      placeholder="username"
                    />
                  </div>
                </label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {section.metrics.map((metric) => (
                    <label key={`${section.key}-${metric}`} className="space-y-1">
                      <span className="text-xs text-slate-600">
                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={value.socialStats?.[section.key]?.[metric] ?? ''}
                        onChange={(e) => updateSocialMetric(section.key, metric, e.target.value)}
                        className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                        placeholder={`e.g. ${metric === 'views' ? '12000' : '3400'}`}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
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
