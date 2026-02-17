import { Vote, Users, FolderOpen, TrendingUp } from "lucide-react";
import type { EventStats } from "@/types/event";
import { cn } from "@/lib/utils";

interface LiveEventStatsProps {
  stats: EventStats;
  className?: string;
}

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatRow({ icon, label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-muted-foreground">{icon}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-lg font-bold text-foreground tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

export function LiveEventStats({ stats, className }: LiveEventStatsProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-base font-bold text-foreground">Live Event Stats</h3>
      </div>

      <div className="divide-y divide-border px-5">
        <StatRow
          icon={<Vote className="h-4 w-4" />}
          label="Total Votes"
          value={stats.total_votes}
        />
        <StatRow
          icon={<Users className="h-4 w-4" />}
          label="Total Contestants"
          value={stats.total_contestants}
        />
        <StatRow
          icon={<FolderOpen className="h-4 w-4" />}
          label="Active Categories"
          value={stats.active_categories}
        />
        <StatRow
          icon={<TrendingUp className="h-4 w-4" />}
          label="Votes Today"
          value={stats.votes_today}
        />
      </div>
    </div>
  );
}
