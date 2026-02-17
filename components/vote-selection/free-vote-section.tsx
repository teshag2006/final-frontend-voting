"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { VoteEligibility } from "@/types/vote";

interface FreeVoteSectionProps {
  eligibility: VoteEligibility;
  onUseFreeVote: () => void;
  isLoading?: boolean;
}

export function FreeVoteSection({
  eligibility,
  onUseFreeVote,
  isLoading = false,
}: FreeVoteSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  const canUseFree = eligibility.freeEligible && !eligibility.freeUsed;

  if (!eligibility.freeEligible) {
    return null; // Hide for non-Ethiopian voters
  }

  return (
    <div
      className={`rounded-2xl border-2 p-6 transition-all ${
        canUseFree
          ? "border-accent bg-accent/5 hover:border-accent/80 hover:bg-accent/8"
          : "border-muted bg-muted/5"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {canUseFree ? (
            <CheckCircle2 className="h-6 w-6 text-accent" />
          ) : (
            <AlertCircle className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {canUseFree ? (
            <>
              <h3 className="text-lg font-bold text-foreground">
                You have 1 FREE vote available!
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Verify your Ethiopian phone number via SMS to cast your free vote.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-foreground">
                Your free vote has already been used
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You've already claimed your 1 free vote for this event. Purchase paid votes to continue voting.
              </p>
            </>
          )}

          <button
            onClick={onUseFreeVote}
            disabled={!canUseFree || isLoading}
            className={`mt-4 inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
              canUseFree
                ? "bg-accent text-accent-foreground shadow-md hover:bg-accent/90 hover:shadow-lg"
                : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
            } ${isLoading ? "opacity-75" : ""}`}
            aria-busy={isLoading}
          >
            {isLoading ? "Processing..." : "Use Free Vote"}
          </button>
        </div>
      </div>
    </div>
  );
}
