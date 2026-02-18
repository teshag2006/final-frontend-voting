'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { SettingsGeneralTab } from '@/components/admin/settings-general-tab';
import { SettingsSecurityTab } from '@/components/admin/settings-security-tab';
import { DangerZoneSection } from '@/components/admin/danger-zone-section';
import {
  getDefaultGeneralSettings,
  getDefaultEventSettings,
  getDefaultPaymentSettings,
  getDefaultSecuritySettings,
  getDefaultFraudDetectionSettings,
  getDefaultBlockchainSettings,
  getDefaultNotificationSettings,
} from '@/lib/settings-mock';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');

  // Initialize settings data
  const [generalSettings, setGeneralSettings] = useState(getDefaultGeneralSettings());
  const [eventSettings, setEventSettings] = useState(getDefaultEventSettings());
  const [paymentSettings, setPaymentSettings] = useState(getDefaultPaymentSettings());
  const [securitySettings, setSecuritySettings] = useState(getDefaultSecuritySettings());
  const [fraudSettings, setFraudSettings] = useState(getDefaultFraudDetectionSettings());
  const [blockchainSettings, setBlockchainSettings] = useState(getDefaultBlockchainSettings());
  const [notificationSettings, setNotificationSettings] = useState(getDefaultNotificationSettings());

  const handleSave = async (category: string, data: any) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      console.log(`Saved ${category} settings`, data);
    } catch (error) {
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  const handleMaintenanceAction = async (actionName: string) => {
    try {
      // Simulate maintenance action
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setAlertType('success');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      console.log(`Executed: ${actionName}`);
    } catch (error) {
      setAlertType('error');
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

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
            initialData={generalSettings}
            onSave={async (data) => {
              setGeneralSettings(data);
              await handleSave('General', data);
            }}
          />
        </TabsContent>

        <TabsContent value="event">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Event Configuration</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Auto Publish Results</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {eventSettings.autoPublishResults ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Schedule Edits After Launch</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {eventSettings.allowScheduleEditsAfterLaunch ? 'Allowed' : 'Blocked'}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Default Voting Duration</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {eventSettings.defaultVotingDurationHours} hours
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Max Contestants Per Category</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {eventSettings.maxContestantsPerCategory}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => handleSave('Event', eventSettings)}>Save Event Settings</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Payment Configuration</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Primary Provider</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{paymentSettings.primaryProvider}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Fallback Provider</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{paymentSettings.fallbackProvider}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Settlement Currency</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{paymentSettings.currency}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Retry Failed Payments</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {paymentSettings.retryFailedPayments ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => handleSave('Payment', paymentSettings)}>Save Payment Settings</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <SettingsSecurityTab
            initialData={securitySettings}
            onSave={async (data) => {
              setSecuritySettings(data);
              await handleSave('Security', data);
            }}
          />
        </TabsContent>

        <TabsContent value="fraud">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Fraud Detection Settings</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Velocity Threshold / Min</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{fraudSettings.velocityThresholdPerMinute}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Trust Score Threshold</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{fraudSettings.trustScoreThreshold}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Auto Block Critical Risk</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {fraudSettings.autoBlockCriticalRisk ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => handleSave('Fraud Detection', fraudSettings)}>Save Fraud Settings</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Blockchain Settings</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Network</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{blockchainSettings.network}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Anchor Interval</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {blockchainSettings.autoAnchorIntervalMinutes} minutes
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Retry Attempts</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{blockchainSettings.retries}</p>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => handleSave('Blockchain', blockchainSettings)}>Save Blockchain Settings</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-6">Notification Settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Email Notifications</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {notificationSettings.emailEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">SMS Notifications</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {notificationSettings.smsEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">In-App Notifications</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {notificationSettings.inAppEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Critical Alerts Only</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {notificationSettings.criticalAlertsOnly ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => handleSave('Notifications', notificationSettings)}>Save Notification Settings</Button>
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
