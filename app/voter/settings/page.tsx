import type { Metadata } from 'next';
import Link from 'next/link';
import { getVoterProfile } from '@/lib/api';
import { mockVoterProfile } from '@/lib/voter-mock';
import { ProfileForm } from '@/components/voter/profile-form';
import { PhoneVerification } from '@/components/voter/phone-verification';
import { DeleteAccount } from '@/components/voter/delete-account';
import { VoterNavTabs } from '@/components/voter/voter-nav-tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Chrome } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Account Settings | Miss & Mr Africa',
  description: 'Manage your account settings and preferences',
};

export default async function SettingsPage() {
  const apiProfile = await getVoterProfile();
  const profile = apiProfile || mockVoterProfile;

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Tabs */}
      <VoterNavTabs />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and security preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Profile Information */}
          <ProfileForm profile={profile} />

          {/* Phone Verification */}
          <PhoneVerification
            isVerified={profile.phoneVerified}
            phoneNumber={profile.phoneNumber}
          />

          {/* Google Connection */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="pt-1">
                <Chrome className="w-6 h-6 text-blue-600" />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  Google Account Connection
                </h3>

                {profile.googleLinked ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">
                      Your account is connected to Google. You can sign in using your
                      Google account.
                    </p>
                    <Badge variant="default" className="bg-blue-600">
                      Connected
                    </Badge>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect your Google account for easier sign-in and enhanced
                      security.
                    </p>
                    <Button variant="outline" size="sm" className="gap-2" disabled>
                      <Chrome className="w-4 h-4" />
                      Connect Google
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Security</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Active Sessions</p>
                  <p className="text-sm text-muted-foreground">
                    Manage devices where you are logged in
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Manage
                </Button>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Login History</p>
                  <p className="text-sm text-muted-foreground">
                    View recent login attempts
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  View
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Enable
                </Button>
              </div>
            </div>
          </div>

          {/* Delete Account */}
          <DeleteAccount />
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Need help?</strong> Contact our support team if you have any
            questions about your account or security settings.
          </p>
        </div>
      </div>
    </main>
  );
}
