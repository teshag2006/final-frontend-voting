"use client";

import { useState, useMemo } from "react";
import { Minus, Plus } from "lucide-react";
import type { VoteEligibility } from "@/types/vote";

interface PaidVoteSectionProps {
  eligibility: VoteEligibility;
  pricePerVote?: number;
  onQuantityChange?: (quantity: number) => void;
  isLoading?: boolean;
}

const DEFAULT_PRICE = 1.0; // $1 per vote

export function PaidVoteSection({
  eligibility,
  pricePerVote = DEFAULT_PRICE,
  onQuantityChange,
  isLoading = false,
}: PaidVoteSectionProps) {
  const [quantity, setQuantity] = useState(1);

  const maxAllowed = useMemo(() => {
    return Math.min(
      eligibility.maxPerTransaction,
      eligibility.paidVotesRemaining,
      eligibility.dailyVotesRemaining
    );
  }, [
    eligibility.maxPerTransaction,
    eligibility.paidVotesRemaining,
    eligibility.dailyVotesRemaining,
  ]);

  const totalCost = useMemo(() => {
    return (quantity * pricePerVote).toFixed(2);
  }, [quantity, pricePerVote]);

  const handleQuantityChange = (newQuantity: number) => {
    const clamped = Math.max(1, Math.min(newQuantity, maxAllowed));
    setQuantity(clamped);
    onQuantityChange?.(clamped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      handleQuantityChange(value);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
      <h3 className="text-lg font-bold text-foreground">Paid Votes</h3>

      {/* Quantity selector */}
      <div className="rounded-xl border border-border bg-secondary/30 overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          {/* Display price per vote */}
          <div className="flex-1">
            <span className="text-sm font-semibold text-foreground">
              1 Vote
            </span>
            <span className="ml-2 text-sm font-bold text-foreground tabular-nums">
              ${pricePerVote.toFixed(2)}
            </span>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isLoading}
              className="p-1.5 rounded-md hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4 text-foreground" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleInputChange}
              disabled={isLoading}
              min="1"
              max={maxAllowed}
              className="w-12 text-center bg-transparent text-sm font-bold text-foreground outline-none"
              aria-label="Vote quantity"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxAllowed || isLoading}
              className="p-1.5 rounded-md hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Total cost */}
      <div className="flex items-baseline justify-between rounded-lg border border-border bg-secondary/20 px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">
          Total Cost
        </span>
        <span className="text-2xl font-bold text-foreground tabular-nums">
          ${totalCost}
        </span>
      </div>

      {/* Limits display */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Paid Votes Remaining:</span>
          <span className="font-semibold text-foreground">
            {eligibility.paidVotesRemaining} / {eligibility.maxPerTransaction + eligibility.paidVotesRemaining}
          </span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Daily Limit Remaining:</span>
          <span className="font-semibold text-foreground">
            {eligibility.dailyVotesRemaining} / 50
          </span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Max per Transaction:</span>
          <span className="font-semibold text-foreground">
            {eligibility.maxPerTransaction}
          </span>
        </div>
      </div>

      {/* Warning if limits exceeded */}
      {quantity > eligibility.paidVotesRemaining && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Quantity exceeds remaining votes for this event.
        </div>
      )}
      {quantity > eligibility.dailyVotesRemaining && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Quantity exceeds your daily voting limit.
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Quantity and limits are validated again at checkout before payment starts.
      </p>
    </div>
  );
}
