'use client';

import { useEffect, useState } from 'react';
import { OnboardingWizard } from '@/components/contestant-onboarding/onboarding-wizard';
import type {
  ContestantComplianceData,
  ContestantMediaItem,
  ContestantOnboardingData,
  ContestantPublishingState,
  ContestantReadiness,
  ContestantSubmissionStatus,
} from '@/lib/contestant-runtime-store';

interface OnboardingBundle {
  onboarding: ContestantOnboardingData;
  media: ContestantMediaItem[];
  compliance: ContestantComplianceData;
  submissionStatus: ContestantSubmissionStatus;
  readiness: ContestantReadiness;
}

export default function ContestantOnboardingPage() {
  const [bundle, setBundle] = useState<OnboardingBundle | null>(null);
  const [publishing, setPublishing] = useState<ContestantPublishingState | null>(null);
  const [message, setMessage] = useState('');

  async function loadBundle() {
    const [bundleRes, publishingRes] = await Promise.all([
      fetch('/api/contestant/onboarding'),
      fetch('/api/contestant/publishing-state'),
    ]);

    if (bundleRes.ok) {
      const data = (await bundleRes.json()) as OnboardingBundle;
      setBundle(data);
    }
    if (publishingRes.ok) {
      setPublishing((await publishingRes.json()) as ContestantPublishingState);
    }
  }

  async function submitLockedChangeRequest(
    type: 'onboarding' | 'profile' | 'media' | 'compliance',
    payload: Record<string, unknown>,
    promptMessage: string,
    successMessage: string
  ) {
    const reason = window.prompt(promptMessage);
    if (!reason) return;
    await fetch('/api/contestant/change-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, reason, payload }),
    });
    setMessage(successMessage);
  }

  useEffect(() => {
    void loadBundle();
  }, []);

  if (!bundle) {
    return <div className="p-6 text-slate-600">Loading onboarding...</div>;
  }

  return (
    <div className="space-y-4 p-6">
      {publishing ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
          <p>
            Admin review: <strong>{publishing.adminReviewStatus}</strong> | Submission:{' '}
            <strong>{publishing.submissionStatus}</strong> | Public:{' '}
            <strong>{publishing.published ? 'Published' : 'Hidden'}</strong>
          </p>
          {publishing.profileLocked ? (
            <p className="mt-1 text-amber-700">
              Profile and media are locked for competition. Submit change requests for admin review.
            </p>
          ) : null}
          {publishing.rejectionReason ? (
            <p className="mt-1 text-red-600">Rejection reason: {publishing.rejectionReason}</p>
          ) : null}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <OnboardingWizard
        onboarding={bundle.onboarding}
        media={bundle.media}
        compliance={bundle.compliance}
        status={bundle.submissionStatus}
        readiness={bundle.readiness}
        onOnboardingChange={(next) => setBundle((prev) => (prev ? { ...prev, onboarding: next } : prev))}
        onOnboardingSave={async () => {
          const res = await fetch('/api/contestant/onboarding', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bundle.onboarding),
          });
          if (res.status === 423) {
            await submitLockedChangeRequest(
              'onboarding',
              bundle.onboarding as unknown as Record<string, unknown>,
              'Profile is locked. Enter reason for this onboarding update request:',
              'Onboarding change request submitted for admin review.'
            );
          }
          await loadBundle();
        }}
        onMediaSubmit={async (payload) => {
          const res = await fetch('/api/contestant/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.status === 423) {
            await submitLockedChangeRequest(
              'media',
              payload as unknown as Record<string, unknown>,
              'Media is locked. Enter reason for this media update request:',
              'Media change request submitted for admin review.'
            );
          }
          await loadBundle();
        }}
        onComplianceChange={(next) => setBundle((prev) => (prev ? { ...prev, compliance: next } : prev))}
        onComplianceSave={async () => {
          const res = await fetch('/api/contestant/compliance', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bundle.compliance),
          });
          if (res.status === 423) {
            await submitLockedChangeRequest(
              'compliance',
              bundle.compliance as unknown as Record<string, unknown>,
              'Compliance is locked. Enter reason for this compliance update request:',
              'Compliance change request submitted for admin review.'
            );
          }
          await loadBundle();
        }}
        onStatusChange={async (next) => {
          await fetch('/api/contestant/submission-status', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: next }),
          });
          await loadBundle();
        }}
      />
    </div>
  );
}
