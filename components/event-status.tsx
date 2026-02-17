import { CheckCircle2, Globe2, BarChart3 } from "lucide-react";
import type { EventSummary } from "@/types/event";

interface EventStatusProps {
  summary: EventSummary | null;
}

export function EventStatus({ summary }: EventStatusProps) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-lg font-bold text-foreground">Event Status</h3>
      </div>

      {/* Total Votes */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-sm text-muted-foreground">Total Votes</span>
        <span className="text-lg font-bold text-foreground tabular-nums">
          {summary?.total_votes?.toLocaleString() ?? "--"}
        </span>
      </div>

      {/* Status rows */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm text-muted-foreground">Total Countries Voting</span>
        </div>
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <Globe2 className="h-4 w-4 text-sky-500" />
          <span className="text-sm text-muted-foreground">International Voting Active</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-3">
          <BarChart3 className="h-4 w-4 text-foreground" />
          <span className="text-sm text-muted-foreground">Real-Time Leaderboard</span>
        </div>
      </div>
    </div>
  );
}
