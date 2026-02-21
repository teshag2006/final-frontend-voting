'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ContestantMediaItem } from '@/lib/contestant-runtime-store';

export function MediaUploadForm({
  items,
  onSubmit,
}: {
  items: ContestantMediaItem[];
  onSubmit: (payload: { kind: ContestantMediaItem['kind']; label: string; url: string }) => Promise<void>;
}) {
  const [kind, setKind] = useState<ContestantMediaItem['kind']>('profile_photo');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Media Submission</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as ContestantMediaItem['kind'])}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="profile_photo">Profile Photo</option>
          <option value="gallery_image">Gallery Image</option>
          <option value="intro_video_embed">Intro Video Embed</option>
        </select>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Main headshot)"
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Image URL or embed URL"
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Intro video embeds currently support YouTube, TikTok, and Instagram domains.
      </p>
      <Button
        className="mt-3"
        onClick={() => {
          if (!label.trim() || !url.trim()) return;
          onSubmit({ kind, label: label.trim(), url: url.trim() }).then(() => {
            setLabel('');
            setUrl('');
          });
        }}
      >
        Submit Media
      </Button>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <p className="font-medium text-slate-900">{item.label}</p>
            <p className="text-slate-600">{item.kind.replace('_', ' ')}</p>
            <p className="truncate text-xs text-slate-500">{item.url}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
