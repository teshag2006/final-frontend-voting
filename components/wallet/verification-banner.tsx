import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface VerificationBannerProps {
  isVerified: boolean;
}

export function VerificationBanner({ isVerified }: VerificationBannerProps) {
  if (isVerified) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-900">Phone Verified - Free Votes Activated</p>
              <p className="mt-0.5 text-xs text-emerald-700">You can now use one free vote per category</p>
            </div>
          </div>

          <div className="text-xs text-emerald-900">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="font-semibold">Ethiopian Voters</p>
                <ul className="mt-1 space-y-0.5 text-emerald-800">
                  <li>1 FREE vote per event (SMS verified)</li>
                  <li>Paid votes allowed with limits</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">International Voters</p>
                <ul className="mt-1 space-y-0.5 text-emerald-800">
                  <li>Paid votes only</li>
                  <li>Vote limits apply</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex flex-1 items-center gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-900">Unlock Your Free Votes</p>
          <p className="mt-0.5 text-xs text-amber-700">Verify your Ethiopian phone number to get 1 free vote per category</p>
        </div>
      </div>
      <Link href="/verify-phone">
        <Button size="sm" variant="default" className="bg-blue-600 text-white hover:bg-blue-700">
          Verify Now
        </Button>
      </Link>
    </div>
  );
}
