import { CheckCircle2, AlertCircle } from "lucide-react";
import type { VoteEligibility } from "@/types/vote";

interface PaidVotesSummaryProps {
  eligibility: VoteEligibility;
  quantity: number;
  totalCost: string;
}

export function PaidVotesSummary({
  eligibility,
  quantity,
  totalCost,
}: PaidVotesSummaryProps) {
  const allChecksPass =
    eligibility.paidVotesRemaining >= quantity &&
    eligibility.dailyVotesRemaining >= quantity &&
    eligibility.maxPerTransaction >= quantity;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        {allChecksPass ? (
          <CheckCircle2 className="h-6 w-6 text-accent" />
        ) : (
          <AlertCircle className="h-6 w-6 text-destructive" />
        )}
        <h3 className="text-lg font-bold text-foreground">
          Purchase Summary
        </h3>
      </div>

      {/* Checks */}
      <div className="space-y-2">
        <div
          className={`flex items-center gap-2 text-sm ${
            eligibility.paidVotesRemaining >= quantity
              ? "text-muted-foreground"
              : "text-destructive"
          }`}
        >
          <CheckCircle2
            className={`h-4 w-4 flex-shrink-0 ${
              eligibility.paidVotesRemaining >= quantity
                ? "text-accent"
                : "text-destructive"
            }`}
          />
          <span>
            Paid Votes Remaining:{" "}
            <span className="font-semibold">
              {eligibility.paidVotesRemaining} / 300
            </span>
          </span>
        </div>

        <div
          className={`flex items-center gap-2 text-sm ${
            eligibility.dailyVotesRemaining >= quantity
              ? "text-muted-foreground"
              : "text-destructive"
          }`}
        >
          <CheckCircle2
            className={`h-4 w-4 flex-shrink-0 ${
              eligibility.dailyVotesRemaining >= quantity
                ? "text-accent"
                : "text-destructive"
            }`}
          />
          <span>
            Daily Limit Remaining:{" "}
            <span className="font-semibold">
              {eligibility.dailyVotesRemaining} / 50
            </span>
          </span>
        </div>

        <div
          className={`flex items-center gap-2 text-sm ${
            eligibility.maxPerTransaction >= quantity
              ? "text-muted-foreground"
              : "text-destructive"
          }`}
        >
          <CheckCircle2
            className={`h-4 w-4 flex-shrink-0 ${
              eligibility.maxPerTransaction >= quantity
                ? "text-accent"
                : "text-destructive"
            }`}
          />
          <span>
            Max per Transaction:{" "}
            <span className="font-semibold">{eligibility.maxPerTransaction}</span>
          </span>
        </div>
      </div>

      {/* Cost summary */}
      <div className="border-t border-border pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Total Cost:</span>
          <span className="text-2xl font-bold text-foreground tabular-nums">
            ${totalCost}
          </span>
        </div>
      </div>

      {/* Blockchain info */}
      <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2">
        <p className="text-xs text-muted-foreground">
          All votes anchored on the Ethereum blockchain.
        </p>
      </div>

      {/* CTA Button */}
      <button
        disabled={!allChecksPass}
        className={`w-full py-3 rounded-lg font-semibold text-sm transition-all active:scale-[0.98] ${
          allChecksPass
            ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg"
            : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
        }`}
      >
        Proceed to Secure Checkout
      </button>
    </div>
  );
}
