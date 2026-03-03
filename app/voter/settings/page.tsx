'use client';

import { useEffect, useState } from 'react';
import { getVoterPayments, getVoterProfile } from '@/lib/api';
import { VoterUnifiedShell } from '@/components/voter/voter-unified-shell';
import { VoterSettingsPage } from '@/components/voter/voter-settings-page';
import { authService } from '@/lib/services/authService';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const token = authService.getToken() || undefined;
      const [profileRes, paymentsRes] = await Promise.all([
        getVoterProfile(token),
        getVoterPayments(token),
      ]);

      setProfile(profileRes || {});
      setRecentPayments(Array.isArray(paymentsRes?.payments) ? paymentsRes.payments : []);
    };
    void load();
  }, []);

  return (
    <VoterUnifiedShell>
      <VoterSettingsPage profile={profile || {}} recentPayments={recentPayments} />
    </VoterUnifiedShell>
  );
}
