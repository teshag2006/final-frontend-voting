"use client";

import { Globe, CheckCircle2, TrendingUp } from "lucide-react";
import type { CategorySummary } from "@/types/category";

interface CategorySummaryProps {
  summary: CategorySummary;
  isLoading?: boolean;
}

function formatVotes(votes: number): string {
  if (votes >= 1000000) {
    return `${(votes / 1000000).toFixed(1)}M`;
  }
  if (votes >= 1000) {
    return `${(votes / 1000).toFixed(1)}K`;
  }
  return votes.toLocaleString();
}

export function CategorySummaryComponent({ summary, isLoading }: CategorySummaryProps) {
  return (
    <div className="mb-6 grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
      {/* Total Votes */}
      <div className="flex items-center gap-3 border-b pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Total Votes
          </p>
          {isLoading ? (
            <div className="mt-0.5 h-5 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-lg font-bold text-foreground">
              {formatVotes(summary.total_votes)}
            </p>
          )}
        </div>
      </div>

      {/* Active Countries */}
      <div className="flex items-center gap-3 border-b pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
          <Globe className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active Countries
          </p>
          {isLoading ? (
            <div className="mt-0.5 h-5 w-12 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-lg font-bold text-foreground">
              {summary.active_countries}
            </p>
          )}
        </div>
      </div>

      {/* Blockchain Anchored */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
          <CheckCircle2 className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Blockchain Anchored
          </p>
          {isLoading ? (
            <div className="mt-0.5 h-5 w-16 animate-pulse rounded bg-muted" />
          ) : (
            <p className="text-lg font-bold text-foreground">
              {summary.blockchain_anchored_count}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
