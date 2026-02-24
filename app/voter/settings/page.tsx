import type { Metadata } from 'next';
import { getVoterProfile } from '@/lib/api';
import { reseedMockVoterData } from '@/lib/voter-mock';
import { VoterUnifiedShell } from '@/components/voter/voter-unified-shell';
import { VoterSettingsPage } from '@/components/voter/voter-settings-page';

export const metadata: Metadata = {
  title: 'Account Settings | Miss & Mr Africa',
  description: 'Manage your account settings and preferences',
};

export default async function SettingsPage() {
  const fallback = reseedMockVoterData();
  const apiProfile = await getVoterProfile();
  const profile = apiProfile || fallback.profile;

  return (
    <VoterUnifiedShell>
      <VoterSettingsPage profile={profile} recentPayments={fallback.payments.payments} />
    </VoterUnifiedShell>
  );
}
