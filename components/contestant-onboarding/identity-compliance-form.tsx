'use client';

import { Button } from '@/components/ui/button';
import type { ContestantComplianceData } from '@/lib/contestant-runtime-store';

export function IdentityComplianceForm({
  value,
  onChange,
  onSave,
}: {
  value: ContestantComplianceData;
  onChange: (next: ContestantComplianceData) => void;
  onSave: () => Promise<void>;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Identity & Compliance</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input
          value={value.legalName}
          onChange={(e) => onChange({ ...value, legalName: e.target.value })}
          placeholder="Legal name"
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
        />
        <input
          type="date"
          value={value.birthDate}
          onChange={(e) => onChange({ ...value, birthDate: e.target.value })}
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
        />
        <input
          value={value.country}
          onChange={(e) => onChange({ ...value, country: e.target.value })}
          placeholder="Country"
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
        />
        <input
          value={value.idDocumentName}
          onChange={(e) => onChange({ ...value, idDocumentName: e.target.value })}
          placeholder="ID document file name"
          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
        />
      </div>
      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.termsAccepted}
            onChange={(e) => onChange({ ...value, termsAccepted: e.target.checked })}
          />
          I accept platform terms.
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.consentAccepted}
            onChange={(e) => onChange({ ...value, consentAccepted: e.target.checked })}
          />
          I consent to identity verification processing.
        </label>
      </div>
      <Button className="mt-3" onClick={() => void onSave()}>
        Save Compliance
      </Button>
    </section>
  );
}
