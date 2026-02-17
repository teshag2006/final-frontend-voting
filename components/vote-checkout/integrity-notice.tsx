'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface IntegrityNoticeProps {
  className?: string;
}

export function IntegrityNotice({ className }: IntegrityNoticeProps) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-lg p-4 space-y-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-white font-semibold">
            Voting is Final and Non-Refundable
          </p>
          <p className="text-xs text-white/70 mt-1">
            Votes recorded after successful payment cannot be changed or refunded. All votes are
            immutably recorded on the blockchain.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 pt-3 border-t border-white/10">
        <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-white font-semibold">
            Blockchain Verified
          </p>
          <p className="text-xs text-white/70 mt-1">
            Every vote is cryptographically verified and anchored on the Ethereum blockchain for
            complete transparency.
          </p>
        </div>
      </div>
    </div>
  );
}
