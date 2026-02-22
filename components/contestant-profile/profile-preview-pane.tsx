'use client';

import type { ContestantProfileComposerData } from '@/lib/contestant-runtime-store';

function getYouTubeEmbedUrl(raw: string): string {
  const input = raw.trim();
  if (!input) return '';
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let videoId = '';

    if (host === 'youtu.be') {
      videoId = url.pathname.replace('/', '').trim();
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname === '/watch') videoId = url.searchParams.get('v') || '';
      else if (url.pathname.startsWith('/embed/')) videoId = url.pathname.split('/')[2] || '';
      else if (url.pathname.startsWith('/shorts/')) videoId = url.pathname.split('/')[2] || '';
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
}

export function ProfilePreviewPane({ value }: { value: ContestantProfileComposerData }) {
  const youtubeEmbedUrl = getYouTubeEmbedUrl(value.youtube || '');

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Public Preview</h3>
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        {value.photoUrl ? (
          <img
            src={value.photoUrl}
            alt={`${value.displayName || 'Contestant'} profile`}
            className="mb-3 h-28 w-28 rounded-lg object-cover"
          />
        ) : null}
        <p className="text-xl font-semibold text-slate-900">{value.displayName || 'Display Name'}</p>
        <p className="text-sm text-slate-600">{value.category || 'Category'} - {value.location || 'Location'}</p>
        <p className="mt-2 text-sm text-slate-700">{value.bio || 'Your bio will appear here.'}</p>
        <div className="mt-3 space-y-1 text-xs text-slate-500">
          <p>Instagram: {value.instagram || '-'}</p>
          <p>TikTok: {value.tiktok || '-'}</p>
          <p>YouTube: {value.youtube || '-'}</p>
        </div>
        {youtubeEmbedUrl ? (
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-black">
            <iframe
              src={youtubeEmbedUrl}
              title="Intro video preview"
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : null}
      </div>
    </aside>
  );
}
