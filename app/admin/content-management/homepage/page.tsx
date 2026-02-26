'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminContentState } from '@/lib/admin-content-runtime-store';

export default function ContentCmsHomepagePage() {
  const [state, setState] = useState<AdminContentState | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/content')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setState(data as AdminContentState))
      .catch(() => null);
  }, []);

  const save = async () => {
    if (!state) return;
    const res = await fetch('/api/admin/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homepage: state.homepage }),
    });
    if (!res.ok) return setMessage('Could not save homepage content.');
    setMessage('Homepage content saved.');
  };

  if (!state) return <div className="rounded-xl border border-slate-200 bg-white p-4">Loading...</div>;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Homepage Content</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Field label="Hero Title">
          <Input value={state.homepage.heroTitle} onChange={(e) => setState((prev) => prev ? ({ ...prev, homepage: { ...prev.homepage, heroTitle: e.target.value } }) : prev)} />
        </Field>
        <Field label="Hero Subtitle">
          <Input value={state.homepage.heroSubtitle} onChange={(e) => setState((prev) => prev ? ({ ...prev, homepage: { ...prev.homepage, heroSubtitle: e.target.value } }) : prev)} />
        </Field>
        <Field label="Announcement">
          <Input value={state.homepage.announcement} onChange={(e) => setState((prev) => prev ? ({ ...prev, homepage: { ...prev.homepage, announcement: e.target.value } }) : prev)} />
        </Field>
        <Field label="Primary CTA Label">
          <Input value={state.homepage.primaryCtaLabel} onChange={(e) => setState((prev) => prev ? ({ ...prev, homepage: { ...prev.homepage, primaryCtaLabel: e.target.value } }) : prev)} />
        </Field>
        <Field label="Primary CTA URL">
          <Input value={state.homepage.primaryCtaUrl} onChange={(e) => setState((prev) => prev ? ({ ...prev, homepage: { ...prev.homepage, primaryCtaUrl: e.target.value } }) : prev)} />
        </Field>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button onClick={() => void save()}>
          <Save className="mr-2 h-4 w-4" />
          Save Homepage Changes
        </Button>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1">
      <span className="text-xs text-slate-600">{label}</span>
      {children}
    </label>
  );
}
