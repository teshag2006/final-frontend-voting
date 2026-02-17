import type { LiveStatus } from "@/types/event";
import { cn } from "@/lib/utils";

interface LiveBadgeProps {
  status: LiveStatus;
  className?: string;
}

const statusConfig: Record<
  LiveStatus,
  { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
  live: {
    label: "Live Voting",
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  upcoming: {
    label: "Upcoming",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
  closed: {
    label: "Voting Closed",
    dotColor: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
  },
};

export function LiveBadge({ status, className }: LiveBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full animate-pulse", config.dotColor)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
