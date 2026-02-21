'use client';

import type { ContestantProfileComposerData } from '@/lib/contestant-runtime-store';

export function ProfilePreviewPane({ value }: { value: ContestantProfileComposerData }) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Public Preview</h3>
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-xl font-semibold text-slate-900">{value.displayName || 'Display Name'}</p>
        <p className="text-sm text-slate-600">{value.category || 'Category'} • {value.location || 'Location'}</p>
        <p className="mt-2 text-sm text-slate-700">{value.bio || 'Your bio will appear here.'}</p>
        <div className="mt-3 space-y-1 text-xs text-slate-500">
          <p>Instagram: {value.instagram || '-'}</p>
          <p>TikTok: {value.tiktok || '-'}</p>
          <p>YouTube: {value.youtube || '-'}</p>
        </div>
      </div>
    </aside>
  );
}
