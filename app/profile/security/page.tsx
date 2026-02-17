'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { UserNav } from '@/components/auth/user-nav';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, Clock, Smartphone, MapPin, X } from 'lucide-react';

function SecurityContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'password' | 'sessions' | 'login'>('password');

  if (!user) {
    return null;
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new !== passwordData.confirm) {
      alert('Passwords do not match');
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    }, 2000);
  };

  const mockActiveSessions = [
    {
      id: '1',
      device: 'Chrome on MacOS',
      location: 'Toronto, Canada',
      lastActive: '2 minutes ago',
      current: true,
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'Toronto, Canada',
      lastActive: '1 hour ago',
      current: false,
    },
  ];

  const mockLoginHistory = [
    {
      id: '1',
      timestamp: 'Today at 2:30 PM',
      device: 'Chrome on MacOS',
      location: 'Toronto, Canada',
      success: true,
    },
    {
      id: '2',
      timestamp: 'Yesterday at 9:15 AM',
      device: 'Safari on iPhone',
      location: 'Toronto, Canada',
      success: true,
    },
    {
      id: '3',
      timestamp: '2 days ago at 4:45 PM',
      device: 'Firefox on Windows',
      location: 'New York, USA',
      success: true,
    },
  ];

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
          <h1 className="text-2xl font-bold text-white">Security</h1>
          <UserNav />
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'password'
                ? 'text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'sessions'
                ? 'text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Sessions
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'login'
                ? 'text-blue-400 border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Login History
          </button>
        </div>

        {/* Password Tab */}
        {activeTab === 'password' && (
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Change Password</CardTitle>
              <CardDescription className="text-slate-400">
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="current"
                      value={passwordData.current}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="new"
                    value={passwordData.new}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirm"
                    value={passwordData.confirm}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Success Message */}
                {saveSuccess && (
                  <div className="p-4 bg-green-950 border border-green-700 rounded-lg text-green-300 flex gap-2 items-start">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>Password changed successfully!</span>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <Card className="border-slate-700 bg-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Active Sessions</CardTitle>
                <CardDescription className="text-slate-400">
                  Devices currently logged into your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockActiveSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg flex items-start justify-between"
                  >
                    <div className="flex gap-3 flex-1">
                      <Smartphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white">{session.device}</p>
                          {session.current && (
                            <span className="text-xs bg-green-950 text-green-300 px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                          <MapPin className="w-4 h-4" />
                          {session.location}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-400 mt-1">
                          <Clock className="w-4 h-4" />
                          Last active: {session.lastActive}
                        </div>
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-950"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800">
              <CardContent className="pt-6">
                <p className="text-sm text-slate-400 mb-4">
                  Want to log out from all other devices?
                </p>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Logout From All Other Devices
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Login History Tab */}
        {activeTab === 'login' && (
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Login History</CardTitle>
              <CardDescription className="text-slate-400">
                Recent login activity on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLoginHistory.map((login) => (
                  <div
                    key={login.id}
                    className="p-4 bg-slate-700/50 border border-slate-600 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-slate-400" />
                          <p className="font-semibold text-white">{login.device}</p>
                          {login.success && (
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-400 mt-2">
                          <MapPin className="w-4 h-4" />
                          {login.location}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{login.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SecurityPage() {
  return (
    <ProtectedRouteWrapper>
      <SecurityContent />
    </ProtectedRouteWrapper>
  );
}
