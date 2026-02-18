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
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
      <h3 className="font-bold text-white text-lg flex items-center gap-2">
        <span className="text-lg">⚠️</span> Voter Information
      </h3>

      <div className="space-y-4">
        {/* Non-Refundable */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="non-refundable"
            checked={nonRefundableAccepted}
            onCheckedChange={onNonRefundableChange}
            className="mt-1"
          />
          <Label
            htmlFor="non-refundable"
            className="text-sm text-white/80 leading-relaxed cursor-pointer"
          >
            I confirm my vote is <span className="font-semibold">non-refundable</span>
          </Label>
        </div>

        {/* Terms & Conditions */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={onTermsChange}
            className="mt-1"
          />
          <Label
            htmlFor="terms"
            className="text-sm text-white/80 leading-relaxed cursor-pointer"
          >
            I agree to the{' '}
            <a href="/terms" className="text-accent hover:underline font-semibold">
              terms & conditions
            </a>
          </Label>
        </div>

        {/* Final Votes */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="final-votes"
            checked={finalVotesAccepted}
            onCheckedChange={onFinalVotesChange}
            className="mt-1"
          />
          <Label
            htmlFor="final-votes"
            className="text-sm text-white/80 leading-relaxed cursor-pointer"
          >
            I understand votes are <span className="font-semibold">final</span> and cannot be
            changed
          </Label>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="pt-4 border-t border-white/10">
        {allAccepted ? (
          <div className="text-sm text-accent flex items-center gap-2">
            <span className="text-lg">✓</span> All terms accepted
          </div>
        ) : (
          <div className="text-sm text-white/50 flex items-center gap-2">
            <span className="text-lg">○</span> Accept all terms to proceed
          </div>
        )}
      </div>
    </div>
  );
}
