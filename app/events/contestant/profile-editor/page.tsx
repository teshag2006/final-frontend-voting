'use client';

import { useEffect, useState } from 'react';
import { ProfileComposerForm } from '@/components/contestant-profile/profile-composer-form';
import { ProfilePreviewPane } from '@/components/contestant-profile/profile-preview-pane';
import { ProfileVersionHistory } from '@/components/contestant-profile/profile-version-history';
import { ShareKitPanel } from '@/components/contestant-profile/share-kit-panel';
import type {
  ContestantChangeRequest,
  ContestantProfileComposerData,
  ContestantProfileVersion,
  ContestantPublishingState,
  ContestantShareKitLink,
} from '@/lib/contestant-runtime-store';

export default function ContestantProfileEditorPage() {
  const [profile, setProfile] = useState<ContestantProfileComposerData | null>(null);
  const [versions, setVersions] = useState<ContestantProfileVersion[]>([]);
  const [shareKit, setShareKit] = useState<ContestantShareKitLink[]>([]);
  const [publishing, setPublishing] = useState<ContestantPublishingState | null>(null);
  const [requests, setRequests] = useState<ContestantChangeRequest[]>([]);
  const [message, setMessage] = useState('');

  async function loadProfile() {
    const [profileRes, versionsRes, shareKitRes, publishingRes, requestsRes] = await Promise.all([
      fetch('/api/contestant/profile'),
      fetch('/api/contestant/profile-versions'),
      fetch('/api/contestant/share-kit'),
      fetch('/api/contestant/publishing-state'),
      fetch('/api/contestant/change-requests'),
    ]);

    if (profileRes.ok) setProfile((await profileRes.json()) as ContestantProfileComposerData);
    if (versionsRes.ok) setVersions((await versionsRes.json()) as ContestantProfileVersion[]);
    if (shareKitRes.ok) setShareKit((await shareKitRes.json()) as ContestantShareKitLink[]);
    if (publishingRes.ok) setPublishing((await publishingRes.json()) as ContestantPublishingState);
    if (requestsRes.ok) setRequests((await requestsRes.json()) as ContestantChangeRequest[]);
  }

  async function submitLockedChangeRequest(reason: string) {
    if (!profile) return;
    const res = await fetch('/api/contestant/change-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'profile',
        reason,
        payload: profile,
      }),
    });
    if (!res.ok) {
      const errorBody = (await res.json().catch(() => ({}))) as { message?: string };
      setMessage(errorBody.message || 'Could not submit change request.');
      return;
    }
    setMessage('Profile update request submitted for admin review.');
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  if (!profile) return <div className="p-6 text-slate-600">Loading profile editor...</div>;

  return (
    <div className="space-y-4 p-6">
      {publishing ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <p>
            Admin review: <strong>{publishing.adminReviewStatus}</strong> | Public:{' '}
            <strong>{publishing.published ? 'Published' : 'Hidden'}</strong>
          </p>
          {publishing.profileLocked ? (
            <p className="mt-1 text-amber-700">Profile fields are locked. Submit a change request for any updates.</p>
          ) : null}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <ProfileComposerForm
            value={profile}
            onChange={setProfile}
            onSave={async () => {
              const res = await fetch('/api/contestant/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
              });
              if (res.status === 423) {
                const reason = window.prompt('Profile is locked. Enter reason for update request:');
                if (reason) {
                  await submitLockedChangeRequest(reason);
                }
              } else if (!res.ok) {
                const errorBody = (await res.json().catch(() => ({}))) as { message?: string };
                setMessage(errorBody.message || 'Profile update failed');
                return;
              } else {
                setMessage('Profile updated successfully.');
              }
              await loadProfile();
            }}
          />
          <ShareKitPanel
            links={shareKit}
            onCreated={(item) => setShareKit((prev) => [item, ...prev])}
          />

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">My Change Requests</h3>
            <div className="mt-3 space-y-2 text-sm">
              {requests.slice(0, 5).map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="font-medium text-slate-800">{item.type} - {item.status}</p>
                  <p className="text-slate-600">{item.reason}</p>
                </div>
              ))}
              {requests.length === 0 ? <p className="text-slate-500">No change requests yet.</p> : null}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <ProfilePreviewPane value={profile} />
          <ProfileVersionHistory versions={versions} />
        </div>
      </div>
    </div>
  );
}
