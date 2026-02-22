'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  ContestantChangeRequest,
  ContestantMediaItem,
  ContestantPublishingState,
} from '@/lib/contestant-runtime-store';

export default function ContestantGalleryPage() {
  const [media, setMedia] = useState<ContestantMediaItem[]>([]);
  const [publishing, setPublishing] = useState<ContestantPublishingState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingPreview, setUploadingPreview] = useState<string | null>(null);
  const [recentlyUploadedIds, setRecentlyUploadedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const galleryItems = media.filter((item) => item.kind === 'gallery_image');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [mediaRes, publishingRes] = await Promise.all([
        fetch('/api/contestant/media'),
        fetch('/api/contestant/publishing-state'),
      ]);
      if (mediaRes.ok) setMedia((await mediaRes.json()) as ContestantMediaItem[]);
      if (publishingRes.ok) setPublishing((await publishingRes.json()) as ContestantPublishingState);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const submitLockedChangeRequest = async (payload: Record<string, unknown>, reason: string) => {
    const res = await fetch('/api/contestant/change-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'media',
        reason,
        payload,
      } satisfies {
        type: ContestantChangeRequest['type'];
        reason: string;
        payload: Record<string, unknown>;
      }),
    });
    return res.ok;
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file.');
      return;
    }

    const maxBytes = 8 * 1024 * 1024;
    if (file.size > maxBytes) {
      setMessage('Image must be 8MB or less.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        setMessage('Could not read the selected image.');
        return;
      }

      setUploadingPreview(result);
      setIsSaving(true);
      try {
        const response = await fetch('/api/contestant/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind: 'gallery_image',
            label: `Gallery Photo ${new Date().toLocaleString()}`,
            url: result,
          }),
        });

        if (response.status === 423) {
          const reason = window.prompt('Gallery is locked. Enter reason for admin review request:');
          if (reason) {
            const ok = await submitLockedChangeRequest(
              { kind: 'gallery_image', label: 'Gallery Photo', url: result },
              reason
            );
            setMessage(ok ? 'Gallery change request submitted for admin review.' : 'Could not submit change request.');
          }
          return;
        }

        if (!response.ok) {
          const errorBody = (await response.json().catch(() => ({}))) as { message?: string };
          setMessage(errorBody.message || 'Gallery upload failed.');
          return;
        }

        const created = (await response.json()) as ContestantMediaItem;
        if (created?.id) {
          setRecentlyUploadedIds((prev) => [created.id, ...prev].slice(0, 10));
        }
        setMessage('Gallery photo uploaded.');
        await loadData();
      } finally {
        setUploadingPreview(null);
        setIsSaving(false);
      }
    };
    reader.onerror = () => setMessage('Could not read the selected image.');
    reader.readAsDataURL(file);
  };

  const handleRemove = async (item: ContestantMediaItem) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/contestant/media?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });

      if (response.status === 423) {
        const reason = window.prompt('Gallery is locked. Enter reason for admin review request:');
        if (reason) {
          const ok = await submitLockedChangeRequest(
            { action: 'remove', mediaId: item.id, kind: item.kind, label: item.label },
            reason
          );
          setMessage(ok ? 'Gallery removal request submitted for admin review.' : 'Could not submit change request.');
        }
        return;
      }

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as { message?: string };
        setMessage(errorBody.message || 'Could not remove gallery photo.');
        return;
      }

      setMessage('Gallery photo removed.');
      await loadData();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Gallery Manager</h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload and maintain contestant gallery photos used on public profile and sponsor review.
          </p>
          {publishing?.profileLocked ? (
            <p className="mt-2 text-sm text-amber-700">
              Profile is locked after approval. Gallery updates will be sent as change requests.
            </p>
          ) : null}
          {message ? (
            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleUpload(event)}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
              className="gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              Upload Gallery Photo
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Current Gallery</h2>
          {isLoading ? (
            <p className="mt-3 text-sm text-slate-500">Loading gallery...</p>
          ) : galleryItems.length === 0 && !uploadingPreview ? (
            <p className="mt-3 text-sm text-slate-500">No gallery photos uploaded yet.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {uploadingPreview ? (
                <div className="overflow-hidden rounded-lg border border-blue-300 bg-blue-50">
                  <img src={uploadingPreview} alt="Uploading preview" className="h-40 w-full object-cover opacity-70" />
                  <div className="flex items-center justify-between px-3 py-2">
                    <p className="truncate text-xs text-blue-700">Uploading photo...</p>
                    <span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Uploading
                    </span>
                  </div>
                </div>
              ) : null}
              {galleryItems.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <img src={item.url} alt={item.label} className="h-40 w-full object-cover" />
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-slate-600">{item.label}</p>
                      <div className="mt-1 flex items-center gap-1">
                        {recentlyUploadedIds.includes(item.id) ? (
                          <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            Uploaded
                          </span>
                        ) : null}
                        <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600"
                      onClick={() => void handleRemove(item)}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
