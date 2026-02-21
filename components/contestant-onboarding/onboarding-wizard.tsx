'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { OnboardingStepper } from '@/components/contestant-onboarding/stepper';
import { MediaUploadForm } from '@/components/contestant-onboarding/media-upload-form';
import { IdentityComplianceForm } from '@/components/contestant-onboarding/identity-compliance-form';
import { SubmissionStatusBadge } from '@/components/contestant-onboarding/submission-status-badge';
import type {
  ContestantComplianceData,
  ContestantMediaItem,
  ContestantOnboardingData,
  ContestantReadiness,
  ContestantSubmissionStatus,
} from '@/lib/contestant-runtime-store';

const STEPS = ['Basic Info', 'Media', 'Compliance', 'Review'];

export function OnboardingWizard({
  onboarding,
  media,
  compliance,
  status,
  readiness,
  onOnboardingChange,
  onOnboardingSave,
  onMediaSubmit,
  onComplianceChange,
  onComplianceSave,
  onStatusChange,
}: {
  onboarding: ContestantOnboardingData;
  media: ContestantMediaItem[];
  compliance: ContestantComplianceData;
  status: ContestantSubmissionStatus;
  readiness: ContestantReadiness;
  onOnboardingChange: (next: ContestantOnboardingData) => void;
  onOnboardingSave: () => Promise<void>;
  onMediaSubmit: (payload: { kind: ContestantMediaItem['kind']; label: string; url: string }) => Promise<void>;
  onComplianceChange: (next: ContestantComplianceData) => void;
  onComplianceSave: () => Promise<void>;
  onStatusChange: (next: ContestantSubmissionStatus) => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const canSubmit = useMemo(() => readiness.score >= 80, [readiness.score]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold text-slate-900">Contestant Onboarding</h1>
          <div className="flex items-center gap-2">
            <SubmissionStatusBadge status={status} />
            <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">Readiness {readiness.score}%</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-600">Complete onboarding to publish your profile for voting.</p>
        <div className="mt-3">
          <OnboardingStepper steps={STEPS} activeStep={step} />
        </div>
      </div>

      {step === 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Basic Registration</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input value={onboarding.fullName} onChange={(e) => onOnboardingChange({ ...onboarding, fullName: e.target.value })} placeholder="Full name" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
            <input value={onboarding.stageName} onChange={(e) => onOnboardingChange({ ...onboarding, stageName: e.target.value })} placeholder="Stage name" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
            <input value={onboarding.email} onChange={(e) => onOnboardingChange({ ...onboarding, email: e.target.value })} placeholder="Email" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
            <input value={onboarding.phone} onChange={(e) => onOnboardingChange({ ...onboarding, phone: e.target.value })} placeholder="Phone" className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
            <input value={onboarding.category} onChange={(e) => onOnboardingChange({ ...onboarding, category: e.target.value })} placeholder="Category" className="h-10 rounded-md border border-slate-300 px-3 text-sm md:col-span-2" />
          </div>
          <Button className="mt-3" onClick={() => void onOnboardingSave()}>
            Save Basic Info
          </Button>
        </section>
      )}

      {step === 1 && <MediaUploadForm items={media} onSubmit={onMediaSubmit} />}

      {step === 2 && (
        <IdentityComplianceForm
          value={compliance}
          onChange={onComplianceChange}
          onSave={onComplianceSave}
        />
      )}

      {step === 3 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Review & Submit</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {readiness.checks.map((check) => (
              <li key={check.id}>
                {check.done ? 'OK' : 'Missing'}: {check.label}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" onClick={() => void onStatusChange('draft')}>
              Save as Draft
            </Button>
            <Button onClick={() => void onStatusChange('submitted')} disabled={!canSubmit}>
              Submit for Review
            </Button>
          </div>
        </section>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Back
        </Button>
        <Button variant="outline" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>
          Next
        </Button>
      </div>
    </div>
  );
}
