'use client';

import { useEffect, useMemo, useState } from 'react';
import { VoterNavTabs } from '@/components/voter/voter-nav-tabs';
import { DeleteAccount } from '@/components/voter/delete-account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockVoterPayments } from '@/lib/voter-mock';
import {
  Bell,
  Clock3,
  CreditCard,
  Globe,
  Languages,
  Lock,
  Monitor,
  Moon,
  Shield,
  UserRound,
  Wallet,
} from 'lucide-react';

type SectionId = 'profile' | 'security' | 'notifications' | 'voting' | 'payments' | 'privacy';

const SECTION_ITEMS: Array<{ id: SectionId; label: string; icon: any }> = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'voting', label: 'Voting Preferences', icon: Globe },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'privacy', label: 'Privacy & Data', icon: Shield },
];

interface VoterSettingsPageProps {
  profile: any;
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((row) => (
        <div key={row} className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-10 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function VoterSettingsPage({ profile }: VoterSettingsPageProps) {
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: profile?.fullName ?? '',
    email: profile?.email ?? '',
    phone: profile?.phoneNumber ?? '',
    country: 'US',
    timezone: 'America/New_York',
    language: 'en',
    currency: 'USD',
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    eventUpdates: true,
    receiptUpdates: true,
    leaderboardUpdates: true,
    promotions: false,
    emailChannel: true,
    smsChannel: profile?.phoneVerified ?? false,
    pushChannel: false,
    reducedMotion: false,
    highContrast: false,
    largerText: false,
    suspiciousLoginAlerts: true,
    twoFactorEnabled: false,
    analyticsConsent: true,
    marketingConsent: false,
    personalizedRecommendations: true,
  });

  const initialSnapshot = useMemo(() => JSON.stringify(form), []);
  const isDirty = JSON.stringify(form) !== initialSnapshot;

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target?.id) {
          setActiveSection(visible.target.id as SectionId);
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0.1, 0.4] }
    );

    SECTION_ITEMS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [loading]);

  const setField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveMessage(null);
  };

  const handleSave = async () => {
    if (isSaving || !isDirty) return;
    setIsSaving(true);
    setSaveMessage(null);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSaving(false);
    setSaveMessage('Changes saved successfully.');
  };

  const handleDiscard = () => {
    setForm({
      fullName: profile?.fullName ?? '',
      email: profile?.email ?? '',
      phone: profile?.phoneNumber ?? '',
      country: 'US',
      timezone: 'America/New_York',
      language: 'en',
      currency: 'USD',
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      eventUpdates: true,
      receiptUpdates: true,
      leaderboardUpdates: true,
      promotions: false,
      emailChannel: true,
      smsChannel: profile?.phoneVerified ?? false,
      pushChannel: false,
      reducedMotion: false,
      highContrast: false,
      largerText: false,
      suspiciousLoginAlerts: true,
      twoFactorEnabled: false,
      analyticsConsent: true,
      marketingConsent: false,
      personalizedRecommendations: true,
    });
    setSaveMessage('Changes discarded.');
  };

  const scrollToSection = (id: SectionId) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-8">
      <VoterNavTabs />

      <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account, security, and voting preferences.</p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" onClick={handleDiscard} disabled={!isDirty || isSaving}>
              Discard
            </Button>
            <Button onClick={handleSave} disabled={!isDirty || isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="sticky top-24 hidden h-fit rounded-xl border border-border bg-card p-3 lg:block">
          {SECTION_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </aside>

        <section className="space-y-6">
          {saveMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {saveMessage}
            </div>
          )}

          {loading ? (
            <SettingsSkeleton />
          ) : (
            <>
              <article id="profile" className="rounded-xl border border-border bg-card p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Profile</h2>
                  <Badge variant="outline">Voter ID: VTR-2304</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Select value={form.country} onValueChange={(value) => setField('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="NG">Nigeria</SelectItem>
                        <SelectItem value="KE">Kenya</SelectItem>
                        <SelectItem value="ET">Ethiopia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <Select value={form.timezone} onValueChange={(value) => setField('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="America/Chicago">America/Chicago</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="Africa/Lagos">Africa/Lagos</SelectItem>
                        <SelectItem value="Africa/Nairobi">Africa/Nairobi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="photo">Profile Photo</Label>
                    <Input id="photo" type="file" />
                  </div>
                </div>
              </article>

              <article id="security" className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">Security</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Enable app-based or SMS verification on sign-in.</p>
                      </div>
                    </div>
                    <Switch checked={form.twoFactorEnabled} onCheckedChange={(v) => setField('twoFactorEnabled', v)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-start gap-3">
                      <Bell className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Suspicious Login Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified when a new device signs in.</p>
                      </div>
                    </div>
                    <Switch
                      checked={form.suspiciousLoginAlerts}
                      onCheckedChange={(v) => setField('suspiciousLoginAlerts', v)}
                    />
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">Active Sessions</p>
                    </div>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between rounded bg-muted/40 px-3 py-2">
                        <span>Chrome on Windows (Current)</span>
                        <span>New York, US</span>
                      </div>
                      <div className="flex items-center justify-between rounded bg-muted/40 px-3 py-2">
                        <span>Safari on iPhone</span>
                        <Button variant="outline" size="sm">
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <article id="notifications" className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">Notifications</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3 rounded-lg border border-border p-4">
                    <p className="font-medium">Notification Types</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Vote Receipts</span>
                      <Switch checked={form.receiptUpdates} onCheckedChange={(v) => setField('receiptUpdates', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Event Reminders</span>
                      <Switch checked={form.eventUpdates} onCheckedChange={(v) => setField('eventUpdates', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Leaderboard Updates</span>
                      <Switch
                        checked={form.leaderboardUpdates}
                        onCheckedChange={(v) => setField('leaderboardUpdates', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Promotions</span>
                      <Switch checked={form.promotions} onCheckedChange={(v) => setField('promotions', v)} />
                    </div>
                  </div>
                  <div className="space-y-3 rounded-lg border border-border p-4">
                    <p className="font-medium">Delivery Channels</p>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={form.emailChannel} onCheckedChange={(v) => setField('emailChannel', Boolean(v))} />
                      <span className="text-sm">Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={form.smsChannel} onCheckedChange={(v) => setField('smsChannel', Boolean(v))} />
                      <span className="text-sm">SMS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={form.pushChannel} onCheckedChange={(v) => setField('pushChannel', Boolean(v))} />
                      <span className="text-sm">Push</span>
                    </div>
                    <div className="rounded-md border border-border bg-muted/40 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Quiet Hours</p>
                      </div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Enable quiet hours</span>
                        <Switch checked={form.quietHoursEnabled} onCheckedChange={(v) => setField('quietHoursEnabled', v)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="time"
                          value={form.quietHoursStart}
                          onChange={(e) => setField('quietHoursStart', e.target.value)}
                          disabled={!form.quietHoursEnabled}
                        />
                        <Input
                          type="time"
                          value={form.quietHoursEnd}
                          onChange={(e) => setField('quietHoursEnd', e.target.value)}
                          disabled={!form.quietHoursEnabled}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <article id="voting" className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">Voting Preferences</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="mb-1 block">
                      <span className="inline-flex items-center gap-2">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        Language
                      </span>
                    </Label>
                    <Select value={form.language} onValueChange={(value) => setField('language', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="sw">Swahili</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 block">
                      <span className="inline-flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                        Currency Display
                      </span>
                    </Label>
                    <Select value={form.currency} onValueChange={(value) => setField('currency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="NGN">NGN</SelectItem>
                        <SelectItem value="ETB">ETB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      <Moon className="h-4 w-4 text-muted-foreground" />
                      Reduced Motion
                    </span>
                    <Switch checked={form.reducedMotion} onCheckedChange={(v) => setField('reducedMotion', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>High Contrast</span>
                    <Switch checked={form.highContrast} onCheckedChange={(v) => setField('highContrast', v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Larger Text</span>
                    <Switch checked={form.largerText} onCheckedChange={(v) => setField('largerText', v)} />
                  </div>
                </div>
              </article>

              <article id="payments" className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">Payments</h2>
                <div className="mb-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">Saved Methods</p>
                    <p className="mt-2 font-semibold">2 Cards</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">Default Method</p>
                    <p className="mt-2 font-semibold">Visa •••• 4451</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">Recent Spend</p>
                    <p className="mt-2 font-semibold">$47.49</p>
                  </div>
                </div>
                <div className="space-y-2 rounded-lg border border-border p-3">
                  {mockVoterPayments.payments.slice(0, 3).map((payment) => (
                    <div key={payment.receiptNumber} className="flex items-center justify-between rounded bg-muted/30 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{payment.eventName}</p>
                        <p className="text-xs text-muted-foreground">{payment.receiptNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {payment.currency} {payment.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{payment.voteQuantity} votes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article id="privacy" className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-5 text-lg font-semibold text-foreground">Privacy & Data</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <span className="text-sm">Analytics Consent</span>
                    <Switch checked={form.analyticsConsent} onCheckedChange={(v) => setField('analyticsConsent', v)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <span className="text-sm">Marketing Consent</span>
                    <Switch checked={form.marketingConsent} onCheckedChange={(v) => setField('marketingConsent', v)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <span className="text-sm">Personalized Recommendations</span>
                    <Switch
                      checked={form.personalizedRecommendations}
                      onCheckedChange={(v) => setField('personalizedRecommendations', v)}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline">Download My Data</Button>
                    <Button variant="outline">Request Data Export</Button>
                  </div>
                </div>
                <div className="mt-6">
                  <DeleteAccount />
                </div>
              </article>
            </>
          )}
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <Button className="flex-1" onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDiscard} disabled={!isDirty || isSaving}>
            Discard
          </Button>
        </div>
      </div>
    </main>
  );
}
