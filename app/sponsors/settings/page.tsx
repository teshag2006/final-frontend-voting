'use client';

import { type ReactNode, useMemo, useState } from 'react';
import { Building2, CheckCircle2, Circle, FileText, Shield, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SponsorLogoutButton } from '@/components/sponsors/sponsor-logout-button';
import { useEffect } from 'react';
import { getSponsorAuditTrail, getSponsorProfileSettings, saveSponsorProfileSettings } from '@/lib/api';
import type { SponsorAuditEntry } from '@/lib/sponsor-runtime-store';
import { mockSponsorProfileSettings, type SponsorProfileSettings } from '@/lib/sponsorship-mock';

type SettingsTab = 'general' | 'contact' | 'legal' | 'security';

export default function SponsorProfileSettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<SponsorProfileSettings>(mockSponsorProfileSettings);
  const [draftSettings, setDraftSettings] = useState<SponsorProfileSettings>(mockSponsorProfileSettings);
  const [auditTrail, setAuditTrail] = useState<SponsorAuditEntry[]>([]);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  useEffect(() => {
    let mounted = true;
    Promise.all([getSponsorProfileSettings(), getSponsorAuditTrail()]).then(([settingsRes, auditRes]) => {
      if (!mounted) return;
      if (settingsRes) {
        setSettings(settingsRes);
        setDraftSettings(settingsRes);
      }
      if (auditRes) setAuditTrail(auditRes);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const missingItems = useMemo(() => {
    const items: string[] = [];
    if (!draftSettings.contact.address?.trim()) items.push('Complete business address');
    if (!draftSettings.legal.documents?.length) items.push('Upload one legal document');
    items.push('Enable 2FA (optional)');
    return items;
  }, [draftSettings]);

  const handleSaveSettings = async () => {
    setSaveState('saving');
    const saved = await saveSponsorProfileSettings(draftSettings);
    if (!saved) {
      setSaveState('failed');
      return;
    }
    setSettings(saved);
    setDraftSettings(saved);
    setSaveState('saved');
    const auditRes = await getSponsorAuditTrail();
    if (auditRes) setAuditTrail(auditRes);
  };

  const handleDiscard = () => {
    setDraftSettings(settings);
    setSaveState('idle');
  };

  return (
    <div className="min-h-screen bg-slate-100/80">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sponsor Profile</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Profile Settings</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your sponsor profile, contact information, legal data, and security settings.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 sm:block">
              Profile Completion <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">{draftSettings.profileCompletion}%</span>
            </div>
            <SponsorLogoutButton />
          </div>
        </div>
      </header>

      <main className="space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">{draftSettings.profileCompletion}% Complete</h2>
              <p className="text-sm text-slate-600">Profile Completion</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full bg-blue-600" style={{ width: `${draftSettings.profileCompletion}%` }} />
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                {missingItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Circle className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              className="bg-amber-500 text-slate-900 hover:bg-amber-400"
              onClick={() => setTab(missingItems[0]?.toLowerCase().includes('address') ? 'contact' : 'legal')}
            >
              Add Missing Info
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 pt-2">
            <div className="flex flex-wrap gap-1">
              <TabButton active={tab === 'general'} onClick={() => setTab('general')}>
                <Building2 className="h-4 w-4" />
                General
              </TabButton>
              <TabButton active={tab === 'contact'} onClick={() => setTab('contact')}>
                <UserRound className="h-4 w-4" />
                Contact
              </TabButton>
              <TabButton active={tab === 'legal'} onClick={() => setTab('legal')}>
                <FileText className="h-4 w-4" />
                Legal
              </TabButton>
              <TabButton active={tab === 'security'} onClick={() => setTab('security')}>
                <Shield className="h-4 w-4" />
                Security
              </TabButton>
            </div>
          </div>

          <div className="p-5">
          {tab === 'general' && (
            <div className="space-y-5">
              <h2 className="text-4xl font-semibold text-slate-900">General Information</h2>
              <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
                <div className="space-y-2">
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex h-36 w-full items-center justify-center p-4">
                      <div className="text-center">
                        <p className="text-4xl font-semibold tracking-wide text-slate-800">
                          {draftSettings.general.companyName.slice(0, 1).toUpperCase()}
                        </p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {draftSettings.general.companyName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">Change Logo</Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Upload Logo"
                    value={draftSettings.general.companyName}
                    onChange={(value) =>
                      setDraftSettings((prev) => ({ ...prev, general: { ...prev.general, companyName: value } }))
                    }
                  />
                  <Field
                    label="Industry"
                    value={draftSettings.general.industry}
                    onChange={(value) =>
                      setDraftSettings((prev) => ({ ...prev, general: { ...prev.general, industry: value } }))
                    }
                  />
                  <Field
                    label="Website"
                    value={draftSettings.general.website}
                    className="sm:col-span-2"
                    onChange={(value) =>
                      setDraftSettings((prev) => ({ ...prev, general: { ...prev.general, website: value } }))
                    }
                  />
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs text-slate-500">About Us</label>
                    <textarea
                      value={draftSettings.general.description}
                      onChange={(e) =>
                        setDraftSettings((prev) => ({ ...prev, general: { ...prev.general, description: e.target.value } }))
                      }
                      className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                    <p className="mt-1 text-xs text-slate-500">{draftSettings.general.description.length}/200</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'contact' && (
            <div className="space-y-4">
              <h2 className="text-4xl font-semibold text-slate-900">Contact Information</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Contact Person"
                  value={draftSettings.contact.contactPerson}
                  onChange={(value) =>
                    setDraftSettings((prev) => ({ ...prev, contact: { ...prev.contact, contactPerson: value } }))
                  }
                />
                <Field
                  label="Email"
                  value={draftSettings.contact.email}
                  onChange={(value) =>
                    setDraftSettings((prev) => ({ ...prev, contact: { ...prev.contact, email: value } }))
                  }
                />
                <Field
                  label="Phone"
                  value={draftSettings.contact.phone}
                  onChange={(value) =>
                    setDraftSettings((prev) => ({ ...prev, contact: { ...prev.contact, phone: value } }))
                  }
                />
                <Field
                  label="Address"
                  value={draftSettings.contact.address}
                  onChange={(value) =>
                    setDraftSettings((prev) => ({ ...prev, contact: { ...prev.contact, address: value } }))
                  }
                />
                <Field
                  label="Country"
                  value={draftSettings.contact.country}
                  onChange={(value) =>
                    setDraftSettings((prev) => ({ ...prev, contact: { ...prev.contact, country: value } }))
                  }
                />
                <Field
                  label="City"
                  value={draftSettings.contact.city}
                  onChange={(value) =>
                    setDraftSettings((prev) => ({ ...prev, contact: { ...prev.contact, city: value } }))
                  }
                />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <Badge className={draftSettings.contact.emailVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                  {draftSettings.contact.emailVerified ? 'Email verified' : 'Email verification pending'}
                </Badge>
                <Badge className={draftSettings.contact.phoneVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                  {draftSettings.contact.phoneVerified ? 'Phone OTP verified' : 'Phone OTP pending'}
                </Badge>
              </div>
            </div>
          )}

          {tab === 'legal' && (
            <div className="space-y-4">
              <h2 className="text-4xl font-semibold text-slate-900">Legal Settings</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Tax ID"
                  value={draftSettings.legal.taxId}
                  onChange={(value) =>
                    setDraftSettings((prev) => ({ ...prev, legal: { ...prev.legal, taxId: value } }))
                  }
                />
                <Field
                  label="Registration Number"
                  value={draftSettings.legal.registrationNumber}
                  onChange={(value) =>
                    setDraftSettings((prev) => ({ ...prev, legal: { ...prev.legal, registrationNumber: value } }))
                  }
                />
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-900">Uploaded Documents</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {draftSettings.legal.documents.map((document) => (
                    <li key={document} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      {document}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-slate-500">Document upload review is admin-mediated.</p>
              </div>
              <div>
                <Badge className={draftSettings.legal.termsAccepted ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}>
                  {draftSettings.legal.termsAccepted ? 'Terms accepted' : 'Terms not accepted'}
                </Badge>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-3">
              <h2 className="text-4xl font-semibold text-slate-900">Security</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Current Password" value="********" type="password" onChange={() => undefined} />
                <Field label="New Password" value="" type="password" placeholder="Enter new password" onChange={() => undefined} />
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-900">Account Activity</p>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  {draftSettings.security.accountActivity.map((entry) => (
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
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-medium text-slate-900">Audit Trail</p>
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  {auditTrail.length === 0 ? (
                    <p className="text-xs text-slate-500">No sponsor actions recorded yet.</p>
                  ) : (
                    auditTrail.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="rounded-md border border-slate-200 bg-white px-3 py-2">
                        <p className="font-medium text-slate-900">{entry.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-slate-600">{entry.detail}</p>
                        <p className="text-xs text-slate-500">{new Date(entry.at).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

            <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
              <Button type="button" variant="outline" onClick={handleDiscard}>Discard</Button>
              <Button type="button" onClick={handleSaveSettings} disabled={saveState === 'saving'}>
                {saveState === 'saving' ? 'Saving...' : 'Save Changes'}
              </Button>
              {saveState === 'saved' && <span className="self-center text-xs text-emerald-700">Saved</span>}
              {saveState === 'failed' && <span className="self-center text-xs text-red-700">Save failed</span>}
            </div>
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
      className={`inline-flex items-center gap-2 rounded-t-lg border border-b-0 px-4 py-2 text-sm font-medium ${
        active
          ? 'border-slate-300 bg-white text-slate-900 shadow-[inset_0_-2px_0_0_#2563eb]'
          : 'border-transparent bg-transparent text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs text-slate-500">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
