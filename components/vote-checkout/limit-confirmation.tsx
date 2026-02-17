'use client';

import { CheckCircle2 } from 'lucide-react';

interface LimitConfirmationProps {
  paidRemaining: number;
  dailyRemaining: number;
  maxPerTransaction: number;
  quantity: number;
}

export function LimitConfirmation({
  paidRemaining,
  dailyRemaining,
  maxPerTransaction,
  quantity,
}: LimitConfirmationProps) {
  const paidAfter = paidRemaining - quantity;
  const dailyAfter = dailyRemaining - quantity;

  const isValid = paidAfter >= 0 && dailyAfter >= 0 && quantity <= maxPerTransaction;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
      <h3 className="font-bold text-white text-lg">Limit Confirmation</h3>

      <div className="space-y-3">
        {/* Paid Votes Remaining */}
        <div className="flex items-start gap-3">
          <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            paidAfter >= 0 ? 'text-accent' : 'text-red-400'
          }`} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">
              Paid Remaining After Purchase
            </div>
            <div className="text-xs text-white/60 mt-1">
              {paidAfter} / 300
            </div>
          </div>
        </div>

        {/* Daily Votes Remaining */}
        <div className="flex items-start gap-3">
          <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            dailyAfter >= 0 ? 'text-accent' : 'text-red-400'
          }`} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">
              Daily Remaining After Purchase
            </div>
            <div className="text-xs text-white/60 mt-1">
              {dailyAfter} / 50
            </div>
          </div>
        </div>

        {/* Max Per Transaction */}
        <div className="flex items-start gap-3">
          <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            quantity <= maxPerTransaction ? 'text-accent' : 'text-red-400'
          }`} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">
              Max Per Transaction
            </div>
            <div className="text-xs text-white/60 mt-1">
              {quantity} / {maxPerTransaction}
            </div>
          </div>
        </div>
      </div>

      {!isValid && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded text-sm text-red-200">
          ⚠️ Vote quantity exceeds limits. Please adjust your selection.
        </div>
      )}
    </div>
  );
}
