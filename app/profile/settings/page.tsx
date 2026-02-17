'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { UserNav } from '@/components/auth/user-nav';
import { ArrowLeft, Save, Bell, Palette, Globe, Lock } from 'lucide-react';

function SettingsContent() {
  const { user, updatePreferences } = useAuth();
  const router = useRouter();
  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    pushNotifications: user?.preferences?.pushNotifications ?? true,
    theme: (user?.preferences?.theme ?? 'dark') as 'light' | 'dark' | 'system',
    language: user?.preferences?.language ?? 'en',
    twoFactorEnabled: user?.preferences?.twoFactorEnabled ?? false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectChange = (key: string, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    updatePreferences({
      emailNotifications: preferences.emailNotifications,
      pushNotifications: preferences.pushNotifications,
      theme: preferences.theme,
      language: preferences.language,
      twoFactorEnabled: preferences.twoFactorEnabled,
    });

    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
    }, 2000);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-white">Preferences</h1>
          <UserNav />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notifications Section */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <div>
                  <CardTitle className="text-white">Notifications</CardTitle>
                  <CardDescription className="text-slate-400">
                    Manage how you receive notifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-white">Email Notifications</h3>
                  <p className="text-sm text-slate-400">Receive updates via email</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={() => handleToggle('emailNotifications')}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition ${
                      preferences.emailNotifications ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition transform ${
                        preferences.emailNotifications ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}
                    ></div>
                  </div>
                </label>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-white">Push Notifications</h3>
                  <p className="text-sm text-slate-400">Receive browser notifications</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={() => handleToggle('pushNotifications')}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition ${
                      preferences.pushNotifications ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition transform ${
                        preferences.pushNotifications ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}
                    ></div>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Display Section */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" />
                <div>
                  <CardTitle className="text-white">Display</CardTitle>
                  <CardDescription className="text-slate-400">
                    Customize your interface
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Theme
                </label>
                <select
                  value={preferences.theme}
                  onChange={(e) => handleSelectChange('theme', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Language
                </label>
                <select
                  value={preferences.language}
                  onChange={(e) => handleSelectChange('language', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-400" />
                <div>
                  <CardTitle className="text-white">Security</CardTitle>
                  <CardDescription className="text-slate-400">
                    Enhanced security options
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Two-Factor Authentication */}
              <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-400">Add extra security to your account</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.twoFactorEnabled}
                    onChange={() => handleToggle('twoFactorEnabled')}
                    className="sr-only"
                  />
                  <div
                    className={`w-11 h-6 rounded-full transition ${
                      preferences.twoFactorEnabled ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition transform ${
                        preferences.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}
                    ></div>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          {saveSuccess && (
            <div className="p-4 bg-green-950 border border-green-700 rounded-lg text-green-300">
              Preferences saved successfully!
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRouteWrapper>
      <SettingsContent />
    </ProtectedRouteWrapper>
  );
}
