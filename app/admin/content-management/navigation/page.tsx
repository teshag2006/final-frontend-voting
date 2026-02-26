'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminContentState, AdminNavigationMenuItem } from '@/lib/admin-content-runtime-store';

export default function ContentCmsNavigationPage() {
  const [state, setState] = useState<AdminContentState | null>(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    label: '',
    href: '',
    position: 'header' as AdminNavigationMenuItem['position'],
    order: '1',
    visible: true,
  });

  useEffect(() => {
    fetch('/api/admin/content')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setState(data as AdminContentState))
      .catch(() => null);
  }, []);

  const patch = async (next: AdminContentState['navigationMenus'], success: string) => {
    const res = await fetch('/api/admin/content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ navigationMenus: next }),
    });
    const data = (await res.json().catch(() => null)) as AdminContentState | null;
    if (!res.ok || !data) return setMessage('Update failed.');
    setState(data);
    setMessage(success);
  };

  const create = async () => {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'menu', data: { ...form, order: Number(form.order || 1) } }),
    });
    const data = (await res.json().catch(() => null)) as AdminContentState | null;
    if (!res.ok || !data) return setMessage('Could not create menu item.');
    setState(data);
    setMessage('Navigation link added.');
  };

  if (!state) return <div className="rounded-xl border border-slate-200 bg-white p-4">Loading...</div>;
  const sorted = [...state.navigationMenus].sort((a, b) => a.order - b.order);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Navigation Menus</h2>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <Input placeholder="Menu label" value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
        <Input placeholder="Menu URL" value={form.href} onChange={(e) => setForm((p) => ({ ...p, href: e.target.value }))} />
        <select
          value={form.position}
          onChange={(e) => setForm((p) => ({ ...p, position: e.target.value as AdminNavigationMenuItem['position'] }))}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
        >
          <option value="header">Header</option>
          <option value="mobile">Mobile</option>
        </select>
        <Input type="number" min={1} placeholder="Order" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))} />
      </div>
      <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={form.visible} onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))} />
        Visible
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => void create()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Menu Link
        </Button>
        <Button variant="outline" onClick={() => void patch(state.navigationMenus, 'Navigation changes saved.')}>
          <Save className="mr-2 h-4 w-4" />
          Save Menu Changes
        </Button>
      </div>
      {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}

      <div className="mt-4 space-y-2">
        {sorted.map((item, idx) => (
          <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-medium text-slate-900">{item.label}</p>
            <p className="text-xs text-slate-500">{item.href} | {item.position} | order {item.order}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const label = window.prompt('Menu label', item.label);
                  if (label === null) return;
                  const href = window.prompt('Menu URL', item.href);
                  if (href === null) return;
                  const next = state.navigationMenus.map((m) => (m.id === item.id ? { ...m, label, href } : m));
                  void patch(next, 'Menu updated.');
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
                  void patch(next.map((r, i) => ({ ...r, order: i + 1 })), 'Navigation order updated.');
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
                  void patch(next.map((r, i) => ({ ...r, order: i + 1 })), 'Navigation order updated.');
                }}
              >
                <ArrowDown className="mr-1 h-3.5 w-3.5" />
                Down
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void patch(state.navigationMenus.filter((m) => m.id !== item.id), 'Menu removed.')}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

