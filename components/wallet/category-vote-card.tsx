import { Button } from '@/components/ui/button';
import { Circle } from 'lucide-react';
import type { FreeVoteStatus } from '@/types/wallet';

interface CategoryVoteCardProps {
  category: FreeVoteStatus;
  paidVotesAvailable: number;
  isLoading?: boolean;
  onUseFreeVote?: () => void;
  onUsePaidVote?: () => void;
  onBuyVotes?: () => void;
}

export function CategoryVoteCard({
  category,
  paidVotesAvailable,
  isLoading = false,
  onUseFreeVote,
  onUsePaidVote,
  onBuyVotes,
}: CategoryVoteCardProps) {
  const getFreVoteStatus = () => {
    if (!category.isEligible) {
      return { icon: 'white', label: 'Not Eligible', color: 'text-gray-400' };
    }
    if (category.isAvailable) {
      return { icon: 'green', label: 'Available', color: 'text-emerald-600' };
    }
    return { icon: 'blue', label: 'Used', color: 'text-blue-600' };
  };

  const freeStatus = getFreVoteStatus();
  const hasPaidVotes = paidVotesAvailable > 0;
  const canUseFreeVote = category.isEligible && category.isAvailable;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Category Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.categoryName}</h3>

      {/* Free Vote Status */}
      <div className="mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Circle className={cn('w-3 h-3 fill-current', freeStatus.color)} />
          <span className="text-sm font-medium text-gray-700">Free Vote:</span>
          <span className={cn('text-sm font-semibold', freeStatus.color)}>{freeStatus.label}</span>
        </div>
      </div>

      {/* Paid Votes Info */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">Paid Votes Remaining: {paidVotesAvailable}</p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {canUseFreeVote && (
          <Button
            onClick={onUseFreeVote}
            disabled={isLoading}
            variant="outline"
            className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            Use Free Vote
          </Button>
        )}

        {hasPaidVotes ? (
          <Button
            onClick={onUsePaidVote}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Use Paid Vote
          </Button>
        ) : (
          <Button onClick={onBuyVotes} disabled={isLoading} className="w-full bg-gray-200 text-gray-600 hover:bg-gray-300">
            Buy Votes
          </Button>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
