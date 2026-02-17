import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import type { ContestantProfile } from "@/types/contestant";

interface ContestantSummaryProps {
  contestant: ContestantProfile;
}

export function ContestantSummary({ contestant }: ContestantSummaryProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-sm overflow-hidden">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden ring-2 ring-primary/20">
          <Image
            src={contestant.photo_url}
            alt={contestant.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-foreground">
              {contestant.name}
            </h2>
            {contestant.is_verified && (
              <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
            )}
          </div>

          {/* Category */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {contestant.category_name}
            </span>
            <span className="text-sm text-muted-foreground">
              {contestant.country}
            </span>
          </div>

          {/* Vote count and rank */}
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {contestant.total_votes.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">Votes</span>
            <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
              Rank {contestant.rank_overall}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{
            width: `${Math.min((contestant.vote_percentage || 0) * 2, 100)}%`,
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
