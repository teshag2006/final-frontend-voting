'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadMediaFile } from '@/lib/client/upload-media';
import type { AdminContentState, AdminSponsorBanner } from '@/lib/admin-content-types';

export default function ContentCmsBannersPage() {
  const [state, setState] = useState<AdminContentState | null>(null);
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<'success' | 'error'>('success');
  const [uploadError, setUploadError] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    placement: 'homepage_top' as AdminSponsorBanner['placement'],
    active: true,
  });

  useEffect(() => {
    fetch('/api/admin/content')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setState(data as AdminContentState))
      .catch(() => null);
  }, []);

  const placementSections: Array<{ key: AdminSponsorBanner['placement']; label: string }> = [
    { key: 'homepage_top', label: 'Homepage Top' },
    { key: 'contestant_profile', label: 'Contestant Profile' },
  ];

  const patch = async (next: AdminSponsorBanner[], success: string) => {
    const res = await fetch('/api/admin/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sponsorBanners: next }),
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
      setMessage('Upload a banner image before creating the banner.');
      return;
    }
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'banner', data: form }),
    });
    const data = (await res.json().catch(() => null)) as AdminContentState | null;
    if (!res.ok || !data) {
      setMessageTone('error');
      setMessage('Could not create banner.');
      return;
    }
    setState(data);
    setMessageTone('success');
    setMessage('Banner inserted.');
  };

  const handleFormImageUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file.');
      return;
    }
    try {
      setIsUploadingImage(true);
      const imageUrl = await uploadMediaFile(file, 'admin-assets/content/banners');
      setForm((prev) => ({ ...prev, imageUrl }));
      setUploadError('');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not upload banner image.');
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
      const imageUrl = await uploadMediaFile(file, 'admin-assets/content/banners');
      const next = state.sponsorBanners.map((banner) =>
        banner.id === itemId ? { ...banner, imageUrl } : banner
      );
      await patch(next, 'Banner image updated.');
      setUploadError('');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not upload banner image.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const moveWithinPlacement = (
    list: AdminSponsorBanner[],
    placement: AdminSponsorBanner['placement'],
    itemId: string,
    direction: 'up' | 'down'
  ) => {
    const placementItems = list.filter((item) => item.placement === placement);
    const idx = placementItems.findIndex((item) => item.id === itemId);
    if (idx < 0) return list;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= placementItems.length) return list;

    const swapped = [...placementItems];
    [swapped[idx], swapped[targetIdx]] = [swapped[targetIdx], swapped[idx]];
    const byId = new Map(swapped.map((item) => [item.id, item]));

    return list.map((item) =>
      item.placement === placement ? (byId.get(item.id) ?? item) : item
    );
  };

  if (!state) return <div className="rounded-xl border border-slate-200 bg-white p-4">Loading...</div>;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Sponsor Banners</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <Input placeholder="Banner title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <Input placeholder="Target URL" value={form.targetUrl} onChange={(e) => setForm((p) => ({ ...p, targetUrl: e.target.value }))} />
        <select
          value={form.placement}
          onChange={(e) => setForm((p) => ({ ...p, placement: e.target.value as AdminSponsorBanner['placement'] }))}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="homepage_top">Homepage Top</option>
          <option value="contestant_profile">Contestant Profile</option>
        </select>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Events homepage uses only the Sponsor Showcase block (`homepage_top`).
      </p>
      <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs text-slate-600">Banner Image</p>
        <p className="mt-1 text-xs text-slate-500">Recommended: 1400x500 px (ratio ~2.8:1), JPG/WebP.</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {form.imageUrl ? (
            <div className="relative">
              <img src={form.imageUrl} alt="Banner preview" className="h-14 w-20 rounded-md border border-slate-200 object-cover" />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white"
                aria-label="Remove banner image"
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
          Insert Banner
        </Button>
        <Button variant="outline" onClick={() => void patch(state.sponsorBanners, 'Banner changes saved.')}>
          <Save className="mr-2 h-4 w-4" />
          Save Banner Changes
        </Button>
      </div>
      {message ? (
        <p className={`mt-2 text-sm ${messageTone === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>
          {message}
        </p>
      ) : null}
      {uploadError ? <p className="mt-1 text-sm text-red-600">{uploadError}</p> : null}

      <div className="mt-4 space-y-4">
        {placementSections.map((section) => {
          const items = state.sponsorBanners.filter((item) => item.placement === section.key);
          return (
            <div key={section.key} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{section.label}</p>
              <p className="text-xs text-slate-500">Placement: {section.key}</p>
              {items.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">No banners in this placement yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {items.map((item, idx) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <Badge className={item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}>
                          {item.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{item.targetUrl}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const title = window.prompt('Banner title', item.title);
                            if (title === null) return;
                            const targetUrl = window.prompt('Target URL', item.targetUrl);
                            if (targetUrl === null) return;
                            const next = state.sponsorBanners.map((b) =>
                              b.id === item.id ? { ...b, title, targetUrl } : b
                            );
                            void patch(next, 'Banner updated.');
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
                            const next = moveWithinPlacement(state.sponsorBanners, section.key, item.id, 'up');
                            void patch(next, 'Banner order updated.');
                          }}
                        >
                          <ArrowUp className="mr-1 h-3.5 w-3.5" />
                          Up
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={idx === items.length - 1}
                          onClick={() => {
                            const next = moveWithinPlacement(state.sponsorBanners, section.key, item.id, 'down');
                            void patch(next, 'Banner order updated.');
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
                            const next = state.sponsorBanners.map((b) =>
                              b.id === item.id ? { ...b, imageUrl: '' } : b
                            );
                            void patch(next, 'Banner image removed.');
                          }}
                        >
                          <X className="mr-1 h-3.5 w-3.5" />
                          Clear Image
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void patch(state.sponsorBanners.filter((b) => b.id !== item.id), 'Banner removed.')}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Delete Banner
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

