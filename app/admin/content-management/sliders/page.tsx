'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadMediaFile } from '@/lib/client/upload-media';
import type { AdminContentState } from '@/lib/admin-content-types';

export default function ContentCmsSlidersPage() {
  const [state, setState] = useState<AdminContentState | null>(null);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');
  const [uploadError, setUploadError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [form, setForm] = useState({
    headline: '',
    subheadline: '',
    imageUrl: '',
    ctaLabel: '',
    ctaUrl: '',
    order: '1',
    active: true,
  });

  useEffect(() => {
    fetch('/api/admin/content')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setState(data as AdminContentState))
      .catch(() => null);
  }, []);

  const patch = async (next: AdminContentState['homepageSliders'], success: string) => {
    const res = await fetch('/api/admin/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homepageSliders: next }),
    });
    const data = (await res.json().catch(() => null)) as AdminContentState | null;
    if (!res.ok || !data) {
      setMessageTone('error');
      setMessage('Update failed.');
      return;
    }
    setState(data);
    setMessageTone('success');
    setMessage(success);
  };

  const create = async () => {
    if (!form.imageUrl) {
      setMessageTone('error');
      setMessage('Upload a slider image before creating the slider.');
      return;
    }
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'slider', data: { ...form, order: Number(form.order || 1) } }),
    });
    const data = (await res.json().catch(() => null)) as AdminContentState | null;
    if (!res.ok || !data) {
      setMessageTone('error');
      setMessage('Could not create slider.');
      return;
    }
    setState(data);
    setMessageTone('success');
    setMessage('Slider inserted.');
  };

  const handleFormImageUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file.');
      return;
    }
    try {
      setIsUploadingImage(true);
      const imageUrl = await uploadMediaFile(file, 'admin-assets/content/sliders');
      setForm((prev) => ({ ...prev, imageUrl }));
      setUploadError('');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not upload slider image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const replaceItemImage = async (itemId: string, file?: File) => {
    if (!file || !state) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file.');
      return;
    }
    try {
      setIsUploadingImage(true);
      const imageUrl = await uploadMediaFile(file, 'admin-assets/content/sliders');
      const next = state.homepageSliders.map((slider) =>
        slider.id === itemId ? { ...slider, imageUrl } : slider
      );
      await patch(next, 'Slider image updated.');
      setUploadError('');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not upload slider image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (!state) return <div className="rounded-xl border border-slate-200 bg-white p-4">Loading...</div>;
  const sorted = [...state.homepageSliders].sort((a, b) => a.order - b.order);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Homepage Sliders</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <Input placeholder="Headline" value={form.headline} onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value }))} />
        <Input placeholder="Subheadline" value={form.subheadline} onChange={(e) => setForm((p) => ({ ...p, subheadline: e.target.value }))} />
        <Input placeholder="CTA Label" value={form.ctaLabel} onChange={(e) => setForm((p) => ({ ...p, ctaLabel: e.target.value }))} />
        <Input placeholder="CTA URL (/events or https://...)" value={form.ctaUrl} onChange={(e) => setForm((p) => ({ ...p, ctaUrl: e.target.value }))} />
        <Input type="number" min={1} placeholder="Display Order" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))} />
      </div>
      <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs text-slate-600">Slider Image</p>
        <p className="mt-1 text-xs text-slate-500">Recommended: 1920x1080 px (16:9), JPG/WebP.</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {form.imageUrl ? (
            <div className="relative">
              <img src={form.imageUrl} alt="Slider preview" className="h-14 w-20 rounded-md border border-slate-200 object-cover" />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white"
                aria-label="Remove slider image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex h-14 w-20 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white text-[10px] text-slate-500">
              No image
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-100">
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Upload
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              disabled={isUploadingImage}
              onChange={(e) => void handleFormImageUpload(e.target.files?.[0])}
            />
          </label>
          {isUploadingImage ? <span className="text-xs text-slate-500">Uploading...</span> : null}
        </div>
      </div>
      <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
        Active
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => void create()}>
          <Plus className="mr-2 h-4 w-4" />
          Insert Slider
        </Button>
        <Button variant="outline" onClick={() => void patch(state.homepageSliders, 'Slider changes saved.')}>
          <Save className="mr-2 h-4 w-4" />
          Save Slider Changes
        </Button>
      </div>
      {message ? (
        <p className={`mt-2 text-sm ${messageTone === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
          {message}
        </p>
      ) : null}
      {uploadError ? <p className="mt-1 text-sm text-red-600">{uploadError}</p> : null}

      <div className="mt-4 space-y-2">
        {sorted.map((item, idx) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-900">{item.headline}</p>
              <Badge className="bg-blue-100 text-blue-800">Order {item.order}</Badge>
            </div>
            <p className="text-xs text-slate-500">{item.ctaLabel} {'->'} {item.ctaUrl}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const headline = window.prompt('Headline', item.headline);
                  if (headline === null) return;
                  const subheadline = window.prompt('Subheadline', item.subheadline);
                  if (subheadline === null) return;
                  const ctaLabel = window.prompt('CTA Label', item.ctaLabel);
                  if (ctaLabel === null) return;
                  const ctaUrl = window.prompt('CTA URL', item.ctaUrl);
                  if (ctaUrl === null) return;
                  const next = state.homepageSliders.map((s) =>
                    s.id === item.id ? { ...s, headline, subheadline, ctaLabel, ctaUrl } : s
                  );
                  void patch(next, 'Slider updated.');
                }}
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={idx === 0}
                onClick={() => {
                  const next = [...sorted];
                  [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                  void patch(next.map((r, i) => ({ ...r, order: i + 1 })), 'Slider order updated.');
                }}
              >
                <ArrowUp className="mr-1 h-3.5 w-3.5" />
                Up
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={idx === sorted.length - 1}
                onClick={() => {
                  const next = [...sorted];
                  [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
                  void patch(next.map((r, i) => ({ ...r, order: i + 1 })), 'Slider order updated.');
                }}
              >
                <ArrowDown className="mr-1 h-3.5 w-3.5" />
                Down
              </Button>
              <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100">
                <Upload className="mr-1 h-3.5 w-3.5" />
                Upload
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                  disabled={isUploadingImage}
                  onChange={(e) => void replaceItemImage(item.id, e.target.files?.[0])}
                />
              </label>
              <Button
                size="sm"
                variant="outline"
                disabled={!item.imageUrl}
                onClick={() => {
                  const next = state.homepageSliders.map((s) =>
                    s.id === item.id ? { ...s, imageUrl: '' } : s
                  );
                  void patch(next, 'Slider image removed.');
                }}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Clear Image
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void patch(state.homepageSliders.filter((s) => s.id !== item.id), 'Slider removed.')}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Delete Slider
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

