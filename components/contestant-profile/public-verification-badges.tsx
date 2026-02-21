import { CheckCircle2, ShieldCheck, BadgeCheck, Lock } from 'lucide-react';
import type { ContestantPublicVerification } from '@/lib/contestant-runtime-store';

export function PublicVerificationBadges({
  verification,
}: {
  verification: ContestantPublicVerification;
}) {
  const rows = [
    {
      id: 'identity',
      label: 'Identity Verified',
      active: verification.identityVerified,
      icon: CheckCircle2,
    },
    {
      id: 'media',
      label: 'Media Approved',
      active: verification.mediaVerified,
      icon: BadgeCheck,
    },
    {
      id: 'payout',
      label: 'Payout Ready',
      active: verification.payoutReady,
      icon: Lock,
    },
    {
      id: 'fraud',
      label: 'Fraud Review Clear',
      active: verification.fraudReviewClear,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {rows.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              item.active
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
