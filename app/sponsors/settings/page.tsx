'use client';

import { ReactNode, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SponsorLogoutButton } from '@/components/sponsors/sponsor-logout-button';
import { useEffect } from 'react';
import { getSponsorProfileSettings } from '@/lib/api';
import { mockSponsorProfileSettings, type SponsorProfileSettings } from '@/lib/sponsorship-mock';

type SettingsTab = 'general' | 'contact' | 'legal' | 'security';

export default function SponsorProfileSettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<SponsorProfileSettings>(mockSponsorProfileSettings);

  useEffect(() => {
    let mounted = true;
    getSponsorProfileSettings().then((res) => {
      if (!mounted || !res) return;
      setSettings(res);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur lg:-ml-[216px] lg:w-[calc(100%+216px)]">
        <div className="flex items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sponsor Profile</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Profile Settings</h1>
          </div>
          <SponsorLogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Profile Completion</h2>
              <p className="text-sm text-slate-600">Complete all fields to improve trust and verification speed.</p>
            </div>
            <Badge className="bg-blue-100 text-blue-800">{settings.profileCompletion}% complete</Badge>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-blue-600" style={{ width: `${settings.profileCompletion}%` }} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            <TabButton active={tab === 'general'} onClick={() => setTab('general')}>General</TabButton>
            <TabButton active={tab === 'contact'} onClick={() => setTab('contact')}>Contact</TabButton>
            <TabButton active={tab === 'legal'} onClick={() => setTab('legal')}>Legal</TabButton>
            <TabButton active={tab === 'security'} onClick={() => setTab('security')}>Security</TabButton>
          </div>

          {tab === 'general' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Company Name" value={settings.general.companyName} />
              <Field label="Logo Upload URL" value={settings.general.logoUrl} />
              <Field label="Industry" value={settings.general.industry} />
              <Field label="Website" value={settings.general.website} />
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-slate-500">Description</label>
                <textarea
                  defaultValue={settings.general.description}
                  className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>
          )}

          {tab === 'contact' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Contact Person" value={settings.contact.contactPerson} />
              <Field label="Email" value={settings.contact.email} />
              <Field label="Phone" value={settings.contact.phone} />
              <Field label="Address" value={settings.contact.address} />
              <Field label="Country" value={settings.contact.country} />
              <Field label="City" value={settings.contact.city} />
              <div className="sm:col-span-2 flex gap-2 text-xs text-slate-600">
                <Badge className={settings.contact.emailVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                  {settings.contact.emailVerified ? 'Email verified' : 'Email verification pending'}
                </Badge>
                <Badge className={settings.contact.phoneVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                  {settings.contact.phoneVerified ? 'Phone OTP verified' : 'Phone OTP pending'}
                </Badge>
              </div>
            </div>
          )}

          {tab === 'legal' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tax ID" value={settings.legal.taxId} />
              <Field label="Registration Number" value={settings.legal.registrationNumber} />
              <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-900">Uploaded Documents</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {settings.legal.documents.map((document) => (
                    <li key={document}>{document}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-slate-500">Document upload review is admin-mediated.</p>
              </div>
              <div className="sm:col-span-2">
                <Badge className={settings.legal.termsAccepted ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}>
                  {settings.legal.termsAccepted ? 'Terms accepted' : 'Terms not accepted'}
                </Badge>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Current Password" value="********" type="password" />
                <Field label="New Password" value="" type="password" placeholder="Enter new password" />
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-900">Account Activity</p>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  {settings.security.accountActivity.map((entry) => (
                    <div key={`${entry.at}-${entry.ip}`} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                      <p>{entry.at}</p>
                      <p className="text-xs text-slate-600">
                        {entry.device} | {entry.ip}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">2FA is planned for a future release.</p>
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button type="button">Save Changes</Button>
            <Button type="button" variant="outline">Discard</Button>
          </div>
        </section>
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 text-sm font-medium ${
        active ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-slate-500">{label}</label>
      <Input type={type} defaultValue={value} placeholder={placeholder} />
    </div>
  );
}
