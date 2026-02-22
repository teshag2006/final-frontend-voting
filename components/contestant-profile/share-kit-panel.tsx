'use client';

import { useEffect, useState } from 'react';
import type { ContestantShareKitLink } from '@/lib/contestant-runtime-store';

const channelOptions: Array<ContestantShareKitLink['channel']> = [
  'instagram',
  'tiktok',
  'youtube',
  'x',
  'facebook',
];

export function ShareKitPanel({
  links: initialLinks,
  onCreated,
}: {
  links: ContestantShareKitLink[];
  onCreated: (link: ContestantShareKitLink) => void;
}) {
  const [links, setLinks] = useState<ContestantShareKitLink[]>(initialLinks);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [channel, setChannel] = useState<ContestantShareKitLink['channel']>('instagram');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  async function handleAdd() {
    if (!label.trim() || !url.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/contestant/share-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim(), url: url.trim(), channel }),
      });
      if (!res.ok) return;
      const created = (await res.json()) as ContestantShareKitLink;
      setLinks((prev) => [created, ...prev]);
      onCreated(created);
      setLabel('');
      setUrl('');
      setChannel('instagram');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Share Kit</h3>
      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_140px_1fr_auto]">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          placeholder="Link label"
        />
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as ContestantShareKitLink['channel'])}
          className="h-10 rounded-md border border-slate-300 px-2 text-sm"
        >
          {channelOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          placeholder="https://..."
        />
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleAdd()}
          className="h-10 rounded-md bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          Add
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {links.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <p className="font-medium text-slate-800">{item.label}</p>
            <p className="text-xs uppercase text-slate-500">{item.channel}</p>
            <p className="truncate text-xs text-slate-600">{item.url}</p>
          </div>
        ))}
        {links.length === 0 ? <p className="text-sm text-slate-500">No share links added.</p> : null}
      </div>
    </section>
  );
}
