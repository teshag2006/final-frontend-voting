'use client';

import { Button } from '@/components/ui/button';
import type { ContestantProfileComposerData } from '@/lib/contestant-runtime-store';

export function ProfileComposerForm({
  value,
  onChange,
  onSave,
}: {
  value: ContestantProfileComposerData;
  onChange: (next: ContestantProfileComposerData) => void;
  onSave: () => Promise<void>;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Profile Composer</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input value={value.displayName} onChange={(e) => onChange({ ...value, displayName: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="Display name" />
        <input value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="Category" />
        <input value={value.location} onChange={(e) => onChange({ ...value, location: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm md:col-span-2" placeholder="Location" />
        <textarea value={value.bio} onChange={(e) => onChange({ ...value, bio: e.target.value })} className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2" placeholder="Bio" />
        <input value={value.instagram} onChange={(e) => onChange({ ...value, instagram: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="Instagram handle" />
        <input value={value.tiktok} onChange={(e) => onChange({ ...value, tiktok: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm" placeholder="TikTok handle" />
        <input value={value.youtube} onChange={(e) => onChange({ ...value, youtube: e.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm md:col-span-2" placeholder="YouTube handle" />
      </div>
      <Button className="mt-3" onClick={() => void onSave()}>
        Save Profile
      </Button>
    </section>
  );
}
