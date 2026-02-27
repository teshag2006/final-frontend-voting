'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TermsConsentProps {
  nonRefundableAccepted: boolean;
  termsAccepted: boolean;
  finalVotesAccepted: boolean;
  onNonRefundableChange: (checked: boolean) => void;
  onTermsChange: (checked: boolean) => void;
  onFinalVotesChange: (checked: boolean) => void;
}

export function TermsConsent({
  nonRefundableAccepted,
  termsAccepted,
  finalVotesAccepted,
  onNonRefundableChange,
  onTermsChange,
  onFinalVotesChange,
}: TermsConsentProps) {
  const allAccepted = nonRefundableAccepted && termsAccepted && finalVotesAccepted;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <span className="text-lg">??</span> Voter Information
      </h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="non-refundable"
            checked={nonRefundableAccepted}
            onCheckedChange={onNonRefundableChange}
            className="mt-1"
          />
          <Label htmlFor="non-refundable" className="cursor-pointer text-sm leading-relaxed text-slate-700">
            I confirm my vote is <span className="font-semibold">non-refundable</span>
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox id="terms" checked={termsAccepted} onCheckedChange={onTermsChange} className="mt-1" />
          <Label htmlFor="terms" className="cursor-pointer text-sm leading-relaxed text-slate-700">
            I agree to the{' '}
            <a href="/terms" className="font-semibold text-accent hover:underline">
              terms & conditions
            </a>
          </Label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="final-votes"
            checked={finalVotesAccepted}
            onCheckedChange={onFinalVotesChange}
            className="mt-1"
          />
          <Label htmlFor="final-votes" className="cursor-pointer text-sm leading-relaxed text-slate-700">
            I understand votes are <span className="font-semibold">final</span> and cannot be changed
          </Label>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        {allAccepted ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <span className="text-lg">?</span> All terms accepted
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="text-lg">?</span> Accept all terms to proceed
          </div>
        )}
      </div>
    </div>
  );
}
