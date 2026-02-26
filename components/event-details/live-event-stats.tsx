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
    <div className="flex min-w-[170px] items-center gap-2 px-4 py-3">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <div>
        <span className="block text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className="text-lg font-bold text-foreground tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
      </div>
    </div>
  );
}

export function LiveEventStats({ stats, className }: LiveEventStatsProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-stretch">
        <div className="flex min-w-[180px] items-center border-b border-border px-5 py-4 sm:border-b-0 sm:border-r">
          <h3 className="text-base font-bold text-foreground">Live Event Stats</h3>
        </div>
        <div className="flex flex-1 flex-wrap divide-x divide-border">
          <StatRow icon={<Vote className="h-4 w-4" />} label="Total Votes" value={stats.total_votes} />
          <StatRow icon={<Users className="h-4 w-4" />} label="Total Contestants" value={stats.total_contestants} />
          <StatRow icon={<FolderOpen className="h-4 w-4" />} label="Active Categories" value={stats.active_categories} />
          <StatRow icon={<TrendingUp className="h-4 w-4" />} label="Votes Today" value={stats.votes_today} />
        </div>
      </div>
    </div>
  );
}
