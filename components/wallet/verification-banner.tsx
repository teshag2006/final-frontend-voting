import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface VerificationBannerProps {
  isVerified: boolean;
  onVerifyClick?: () => void;
}

export function VerificationBanner({ isVerified, onVerifyClick }: VerificationBannerProps) {
  if (isVerified) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-emerald-900">Phone Verified – Free Votes Activated</p>
          <p className="text-xs text-emerald-700 mt-0.5">You can now use one free vote per category</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 flex-1">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-900">Unlock Your Free Votes</p>
          <p className="text-xs text-amber-700 mt-0.5">Verify your Ethiopian phone number to get 1 free vote per category</p>
        </div>
      </div>
      <Link href="/verify-phone">
        <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
          Verify Now
        </Button>
      </Link>
    </div>
  );
}
