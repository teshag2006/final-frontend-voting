import { BarChart3, Globe2, Shield } from "lucide-react";
import type { EventSummary } from "@/types/event";

interface StatsBarProps {
  summary: EventSummary | null;
}

export function StatsBar({ summary }: StatsBarProps) {
  const stats = [
    {
      icon: BarChart3,
      label: "Event Votes",
      value: summary?.total_votes?.toLocaleString() ?? "--",
      color: "text-foreground",
    },
    {
      icon: Globe2,
      label: "Total Countries Voting",
      value: summary?.active_countries?.toString() ?? "--",
      color: "text-sky-500",
    },
    {
      icon: Shield,
      label: "Blockchain Anchors",
      value: summary?.blockchain_batches?.toString() ?? "--",
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-border bg-card px-6 py-4 shadow-sm lg:justify-between">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-2.5">
          <stat.icon className={`h-5 w-5 ${stat.color}`} />
          <span className="text-sm text-muted-foreground">{stat.label}</span>
          <span className="text-base font-bold text-foreground">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
