'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface CategoryWalletCardProps {
  categoryName: string;
  categoryIcon?: string;
  freeVoteStatus: 'available' | 'used';
  paidPurchased: number;
  paidUsed: number;
  remainingPaid: number;
  dailyRemaining: number;
  status: 'active' | 'closed' | 'limit-reached';
  onVoteClick?: () => void;
  onBuyMoreClick?: () => void;
  isLoading?: boolean;
}

export function CategoryWalletCard({
  categoryName,
  categoryIcon,
  freeVoteStatus,
  paidPurchased,
  paidUsed,
  remainingPaid,
  dailyRemaining,
  status,
  onVoteClick,
  onBuyMoreClick,
  isLoading = false,
}: CategoryWalletCardProps) {
  const isClosed = status === 'closed';
  const isLimitReached = status === 'limit-reached';
  const canVote = !isClosed && !isLimitReached && (freeVoteStatus === 'available' || remainingPaid > 0);

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {categoryIcon && <span className="text-2xl">{categoryIcon}</span>}
            <h3 className="font-semibold text-foreground">{categoryName}</h3>
          </div>
          {isClosed && (
            <Badge variant="destructive" className="whitespace-nowrap">
              Event Closed
            </Badge>
          )}
          {isLimitReached && (
            <Badge variant="secondary" className="whitespace-nowrap bg-orange-100 text-orange-800">
              Daily Limit
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-4">
        {/* Free Vote Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Free Vote</p>
            {freeVoteStatus === 'available' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">Used</span>
            )}
          </div>
          {freeVoteStatus === 'available' && (
            <p className="text-xs text-green-600 font-medium">Available</p>
          )}
        </div>

        {/* Paid Votes Section */}
        <div className="space-y-1.5 rounded-lg bg-secondary/30 p-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Paid Purchased</span>
            <span className="font-medium text-foreground">{paidPurchased}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Paid Used</span>
            <span className="font-medium text-foreground">{paidUsed}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-medium text-foreground">{remainingPaid}</span>
          </div>
        </div>

        {/* Daily Limit Info */}
        {isLimitReached && (
          <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-3">
            <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
            <p className="text-xs text-orange-700">Daily limit reached. Try again tomorrow.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {canVote ? (
            <>
              {freeVoteStatus === 'available' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onVoteClick}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Use Free Vote
                </Button>
              )}
              {remainingPaid > 0 && (
                <Button
                  size="sm"
                  onClick={onVoteClick}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Vote Now
                </Button>
              )}
              {remainingPaid === 0 && freeVoteStatus === 'used' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onBuyMoreClick}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Buy More Votes
                </Button>
              )}
            </>
          ) : (
            <Button size="sm" disabled className="flex-1">
              {isClosed ? 'Voting Closed' : 'Daily Limit Reached'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
