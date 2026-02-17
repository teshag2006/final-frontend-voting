import { WalletIcon } from 'lucide-react';
import type { WalletResponse } from '@/types/wallet';

interface WalletSummaryProps {
  wallet: WalletResponse;
}

export function WalletSummary({ wallet }: WalletSummaryProps) {
  const freeVotesUsed = wallet.freeVotes.filter((v) => v.isUsed && v.isEligible).length;
  const totalCategories = wallet.freeVotes.filter((v) => v.isEligible).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Paid Votes Balance */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-md">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-blue-100">Paid Votes Balance</p>
          <WalletIcon className="w-5 h-5 text-blue-200" />
        </div>
        <p className="text-4xl font-bold">{wallet.paidVotesRemaining}</p>
        <p className="text-xs text-blue-100 mt-2">Remaining votes from ${(wallet.totalPaidVotesPurchased * 2).toFixed(2)} purchased</p>
      </div>

      {/* Free Votes Usage */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-700 mb-2">Free Votes Used</p>
        <div className="flex items-baseline gap-1">
          <p className="text-4xl font-bold text-gray-900">{freeVotesUsed}</p>
          <p className="text-lg text-gray-500">/ {totalCategories}</p>
        </div>
        <p className="text-xs text-gray-600 mt-2">Across categories</p>
      </div>

      {/* Payment Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-700 mb-2">Total Activity</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Votes Purchased:</span>
            <span className="font-semibold text-gray-900">{wallet.totalPaidVotesPurchased}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Votes Used:</span>
            <span className="font-semibold text-gray-900">{wallet.totalVotesUsed}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
