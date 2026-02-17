import { CheckCircle2 } from "lucide-react";
import type { VoteLimits } from "@/types/vote";

interface VoteLimitsInfoProps {
  limits: VoteLimits;
}

export function VoteLimitsInfo({ limits }: VoteLimitsInfoProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-bold text-foreground">
          Vote Limits for Fair Voting
        </h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Max {limits.maxPerEvent} paid votes per user per event
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Prevents vote manipulation and ensures fair competition
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Max {limits.maxPerDay} paid votes per user per day
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Prevents excessive voting within a single day period
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Max {limits.maxPerTransaction} paid votes per transaction
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Spreads voting activity across multiple transactions for transparency
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3">
          <p className="text-xs text-muted-foreground">
            All votes are anchored on the Ethereum blockchain for permanent verification.
          </p>
        </div>
      </div>
    </div>
  );
}
