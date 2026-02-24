'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { SettingsGeneralTab } from '@/components/admin/settings-general-tab';
import { SettingsSecurityTab } from '@/components/admin/settings-security-tab';
import { DangerZoneSection } from '@/components/admin/danger-zone-section';
import { getDefaultGeneralSettings, getDefaultSecuritySettings } from '@/lib/settings-mock';
import type { AdminSettingsBundle, SettingsAuditEntry, SettingsCategory } from '@/lib/admin-settings-runtime-store';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(true);
  const [auditLog, setAuditLog] = useState<SettingsAuditEntry[]>([]);

  const [settings, setSettings] = useState<AdminSettingsBundle | null>(null);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to load settings');
      const payload = (await response.json()) as {
        settings?: AdminSettingsBundle;
        audit?: SettingsAuditEntry[];
      };
      if (payload.settings) setSettings(payload.settings);
      setAuditLog(Array.isArray(payload.audit) ? payload.audit : []);
    } catch {
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      // fallback keeps screen usable if API is unavailable
      setSettings({
        general: getDefaultGeneralSettings(),
        event: {
          autoPublishResults: false,
          allowScheduleEditsAfterLaunch: false,
          defaultVotingDurationHours: 72,
          maxContestantsPerCategory: 100,
          maxGalleryPhotosPerContestant: 10,
        },
        payment: {
          primaryProvider: 'stripe',
          fallbackProvider: 'paypal',
          currency: 'USD',
          retryFailedPayments: true,
        },
        security: getDefaultSecuritySettings(),
        fraud: {
          velocityThresholdPerMinute: 20,
          autoBlockCriticalRisk: true,
          trustScoreThreshold: 30,
        },
        blockchain: {
          network: 'POLYGON',
          autoAnchorIntervalMinutes: 30,
          retries: 3,
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
          inAppEnabled: true,
          criticalAlertsOnly: false,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const handleSave = async (category: SettingsCategory, data: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, data }),
      });
      if (!response.ok) {
        throw new Error('Save failed');
      }
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      await loadSettings();
    } catch {
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleMaintenanceAction = async (actionName: string) => {
    try {
      const response = await fetch('/api/admin/settings/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionName }),
      });
      if (!response.ok) throw new Error('Maintenance action failed');
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      await loadSettings();
    } catch {
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <Card className="p-6 text-slate-600">Loading settings...</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-600 mt-1">Configure global system behavior, security, and integrations</p>
      </div>

      {/* Alert */}
      {showAlert && (
        <Card
          className={`p-4 flex gap-3 ${
            alertType === 'success'
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          {alertType === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p
              className={`text-sm font-medium ${
                alertType === 'success' ? 'text-emerald-900' : 'text-red-900'
              }`}
            >
              {alertType === 'success' ? 'Settings saved successfully' : 'Failed to save settings'}
            </p>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <p className="text-sm font-semibold text-slate-900">Recent Settings Activity</p>
        <div className="mt-2 space-y-2">
          {auditLog.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <p className="font-medium text-slate-800">{item.summary}</p>
              <p className="text-xs text-slate-500">
                {item.category} | v{item.version} | {new Date(item.at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1 mb-6 p-1 bg-slate-100">
          <TabsTrigger value="general" className="text-xs sm:text-sm">
            General
          </TabsTrigger>
          <TabsTrigger value="event" className="text-xs sm:text-sm">
            Events
          </TabsTrigger>
          <TabsTrigger value="payment" className="text-xs sm:text-sm">
            Payment
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm">
            Security
          </TabsTrigger>
          <TabsTrigger value="fraud" className="text-xs sm:text-sm">
            Fraud
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="text-xs sm:text-sm">
            Blockchain
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="text-xs sm:text-sm">
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <SettingsGeneralTab
            initialData={settings.general}
            onSave={async (data) => {
              await handleSave('general', data);
            }}
          />
        </TabsContent>

        <TabsContent value="event">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Event Configuration</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Auto Publish Results</p>
                <input
                  type="checkbox"
                  className="mt-2"
                  checked={settings.event.autoPublishResults}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, event: { ...prev.event, autoPublishResults: e.target.checked } }) : prev)
                  }
                />
              </label>
              <label className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Schedule Edits After Launch</p>
                <input
                  type="checkbox"
                  className="mt-2"
                  checked={settings.event.allowScheduleEditsAfterLaunch}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, event: { ...prev.event, allowScheduleEditsAfterLaunch: e.target.checked } }) : prev)
                  }
                />
              </label>
              <label className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Default Voting Duration (hours)</p>
                <input
                  type="number"
                  className="mt-2 h-9 w-full rounded-md border border-slate-300 px-2"
                  value={settings.event.defaultVotingDurationHours}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, event: { ...prev.event, defaultVotingDurationHours: Number(e.target.value || 0) } }) : prev)
                  }
                />
              </label>
              <label className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Max Contestants Per Category</p>
                <input
                  type="number"
                  className="mt-2 h-9 w-full rounded-md border border-slate-300 px-2"
                  value={settings.event.maxContestantsPerCategory}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, event: { ...prev.event, maxContestantsPerCategory: Number(e.target.value || 0) } }) : prev)
                  }
                />
              </label>
              <label className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Max Gallery Photos Per Contestant</p>
                <input
                  type="number"
                  min={1}
                  className="mt-2 h-9 w-full rounded-md border border-slate-300 px-2"
                  value={settings.event.maxGalleryPhotosPerContestant}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, event: { ...prev.event, maxGalleryPhotosPerContestant: Number(e.target.value || 0) } }) : prev)
                  }
                />
              </label>
            </div>
            <div className="mt-6">
              <Button onClick={() => handleSave('event', settings.event)}>Save Event Settings</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Payment Configuration</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Primary Provider</p>
                <input
                  className="mt-2 h-9 w-full rounded-md border border-slate-300 px-2"
                  value={settings.payment.primaryProvider}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, payment: { ...prev.payment, primaryProvider: e.target.value } }) : prev)
                  }
                />
              </label>
              <label className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Fallback Provider</p>
                <input
                  className="mt-2 h-9 w-full rounded-md border border-slate-300 px-2"
                  value={settings.payment.fallbackProvider}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, payment: { ...prev.payment, fallbackProvider: e.target.value } }) : prev)
                  }
                />
              </label>
              <label className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Settlement Currency</p>
                <input
                  className="mt-2 h-9 w-full rounded-md border border-slate-300 px-2"
                  value={settings.payment.currency}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, payment: { ...prev.payment, currency: e.target.value } }) : prev)
                  }
                />
              </label>
              <label className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Retry Failed Payments</p>
                <input
                  type="checkbox"
                  className="mt-2"
                  checked={settings.payment.retryFailedPayments}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, payment: { ...prev.payment, retryFailedPayments: e.target.checked } }) : prev)
                  }
                />
              </label>
            </div>
            <div className="mt-6">
              <Button onClick={() => handleSave('payment', settings.payment)}>Save Payment Settings</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <SettingsSecurityTab
            initialData={settings.security}
            onSave={async (data) => {
              await handleSave('security', data);
            }}
          />
        </TabsContent>

        <TabsContent value="fraud">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Fraud Detection Settings</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Velocity Threshold / Min</p>
                <input
                  type="number"
                  className="mt-2 h-9 w-full rounded-md border border-slate-300 px-2"
                  value={settings.fraud.velocityThresholdPerMinute}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, fraud: { ...prev.fraud, velocityThresholdPerMinute: Number(e.target.value || 0) } }) : prev)
                  }
                />
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Trust Score Threshold</p>
                <input
                  type="number"
                  className="mt-2 h-9 w-full rounded-md border border-slate-300 px-2"
                  value={settings.fraud.trustScoreThreshold}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, fraud: { ...prev.fraud, trustScoreThreshold: Number(e.target.value || 0) } }) : prev)
                  }
                />
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Auto Block Critical Risk</p>
                <input
                  type="checkbox"
                  className="mt-2"
                  checked={settings.fraud.autoBlockCriticalRisk}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, fraud: { ...prev.fraud, autoBlockCriticalRisk: e.target.checked } }) : prev)
                  }
                />
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => handleSave('fraud', settings.fraud)}>Save Fraud Settings</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Blockchain Settings</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Network</p>
                <input
                  className="mt-2 h-9 w-full rounded-md border border-slate-300 px-2"
                  value={settings.blockchain.network}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, blockchain: { ...prev.blockchain, network: e.target.value } }) : prev)
                  }
                />
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Anchor Interval</p>
                <input
                  type="number"
                  className="mt-2 h-9 w-full rounded-md border border-slate-300 px-2"
                  value={settings.blockchain.autoAnchorIntervalMinutes}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, blockchain: { ...prev.blockchain, autoAnchorIntervalMinutes: Number(e.target.value || 0) } }) : prev)
                  }
                />
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Retry Attempts</p>
                <input
                  type="number"
                  className="mt-2 h-9 w-full rounded-md border border-slate-300 px-2"
                  value={settings.blockchain.retries}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, blockchain: { ...prev.blockchain, retries: Number(e.target.value || 0) } }) : prev)
                  }
                />
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => handleSave('blockchain', settings.blockchain)}>Save Blockchain Settings</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Notification Settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Email Notifications</p>
                <input
                  type="checkbox"
                  className="mt-2"
                  checked={settings.notifications.emailEnabled}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, notifications: { ...prev.notifications, emailEnabled: e.target.checked } }) : prev)
                  }
                />
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">SMS Notifications</p>
                <input
                  type="checkbox"
                  className="mt-2"
                  checked={settings.notifications.smsEnabled}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, notifications: { ...prev.notifications, smsEnabled: e.target.checked } }) : prev)
                  }
                />
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">In-App Notifications</p>
                <input
                  type="checkbox"
                  className="mt-2"
                  checked={settings.notifications.inAppEnabled}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, notifications: { ...prev.notifications, inAppEnabled: e.target.checked } }) : prev)
                  }
                />
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Critical Alerts Only</p>
                <input
                  type="checkbox"
                  className="mt-2"
                  checked={settings.notifications.criticalAlertsOnly}
                  onChange={(e) =>
                    setSettings((prev) => prev ? ({ ...prev, notifications: { ...prev.notifications, criticalAlertsOnly: e.target.checked } }) : prev)
                  }
                />
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => handleSave('notifications', settings.notifications)}>Save Notification Settings</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Maintenance & Utilities</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => handleMaintenanceAction('Rebuild Cache')}
              >
                <div>
                  <p className="font-medium text-slate-900">Rebuild Cache</p>
                  <p className="text-xs text-slate-500">Clear and rebuild all cached data</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => handleMaintenanceAction('Reindex Search')}
              >
                <div>
                  <p className="font-medium text-slate-900">Reindex Search</p>
                  <p className="text-xs text-slate-500">Rebuild search indexes for all entities</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => handleMaintenanceAction('Clear Redis')}
              >
                <div>
                  <p className="font-medium text-slate-900">Clear Redis Cache</p>
                  <p className="text-xs text-slate-500">Remove all Redis cache entries</p>
                </div>
              </Button>
            </div>
          </Card>

          <DangerZoneSection
            title="Danger Zone"
            description="These actions are destructive and irreversible. Proceed with caution."
          >
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => handleMaintenanceAction('Force Logout All Users')}
            >
              Force Logout All Users
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => handleMaintenanceAction('Reset System Settings')}
            >
              Reset System Settings
            </Button>
          </DangerZoneSection>
        </TabsContent>
      </Tabs>
    </div>
  );
}
