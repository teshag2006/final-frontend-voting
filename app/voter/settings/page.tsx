import type { Metadata } from 'next';
import { getVoterProfile } from '@/lib/api';
import { mockVoterProfile } from '@/lib/voter-mock';
import { VoterSettingsPage } from '@/components/voter/voter-settings-page';

export const metadata: Metadata = {
  title: 'Account Settings | Miss & Mr Africa',
  description: 'Manage your account settings and preferences',
};

export default async function SettingsPage() {
  const apiProfile = await getVoterProfile();
  const profile = apiProfile || mockVoterProfile;

  return <VoterSettingsPage profile={profile} />;
}
