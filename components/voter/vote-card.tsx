'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { VoterVote } from '@/types/voter';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

interface VoteCardProps {
  vote: VoterVote;
}

export function VoteCard({ vote }: VoteCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Contestant Image */}
        <div className="flex-shrink-0 h-20 w-20 rounded-full border border-border bg-secondary flex items-center justify-center overflow-hidden">
          {!imageError ? (
            <Image
              src={vote.contestant.profileImageUrl}
              alt={`${vote.contestant.firstName} ${vote.contestant.lastName}`}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
              onError={() => setImageError(true)}
              priority={false}
              unoptimized
            />
          ) : (
            <User className="w-10 h-10 text-muted-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Contestant Info */}
          <h3 className="font-semibold text-foreground truncate">
            {vote.contestant.firstName} {vote.contestant.lastName}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{vote.categoryName}</p>

          {/* Event Info */}
          <p className="text-xs text-muted-foreground mb-3">{vote.eventName}</p>

          {/* Vote Breakdown */}
          <div className="flex flex-wrap gap-2 mb-3">
            {vote.freeVotes > 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Free: {vote.freeVotes}
              </Badge>
            )}
            {vote.paidVotes > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Paid: {vote.paidVotes}
              </Badge>
            )}
          </div>

          {/* Total and Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                {vote.totalVotes}
              </span>
              <span className="text-xs text-muted-foreground">total votes</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(vote.votedAt)}</span>
              {vote.receiptNumber && (
                <Link
                  href={`/receipt/${vote.receiptNumber}`}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Receipt →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
