import { ReactNode } from 'react';
import { ContentCmsNav } from '@/components/admin/content-cms-nav';

export default function ContentManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="space-y-4 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Admin CMS</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Content Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage homepage content, sponsor banners, sliders, navigation menus, and footer links.
        </p>
      </div>
      <ContentCmsNav />
      {children}
    </main>
  );
}

