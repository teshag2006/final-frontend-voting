import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LeaderboardEntry } from "@/types/event";
import { cn } from "@/lib/utils";

interface LeaderboardPreviewProps {
  entries: LeaderboardEntry[];
  eventSlug: string;
  className?: string;
}

const rankColors: Record<number, string> = {
  1: "bg-amber-500 text-primary-foreground",
  2: "bg-slate-400 text-primary-foreground",
  3: "bg-amber-700 text-primary-foreground",
};

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="flex items-center gap-3 py-3">
      {/* Rank */}
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          rankColors[entry.rank] ?? "bg-muted text-muted-foreground"
        )}
      >
        {entry.rank}
      </span>

      {/* Avatar */}
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
        <Image
          src={entry.photo_url}
          alt={entry.name}
          fill
          className="object-cover"
          sizes="36px"
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {entry.name}
        </p>
        <p className="text-xs text-muted-foreground">{entry.category_name}</p>
      </div>

      {/* Votes */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-foreground tabular-nums">
          {entry.total_votes.toLocaleString()}
          <ChevronRight className="ml-0.5 inline h-3 w-3 text-muted-foreground" />
        </p>
        <p className="text-[10px] text-muted-foreground">
          {Math.floor(entry.total_votes * 0.58).toLocaleString()} votes
        </p>
      </div>
    </div>
  );
}

export function LeaderboardPreview({
  entries,
  eventSlug,
  className,
}: LeaderboardPreviewProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-base font-bold text-foreground">
          Current Leaderboard
        </h3>
      </div>

      <div className="divide-y divide-border px-5">
        {entries.map((entry) => (
          <LeaderboardRow key={entry.contestant_id} entry={entry} />
        ))}
      </div>

      <div className="px-5 py-4">
        <Link
          href={`/events/${eventSlug}/leaderboard`}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
        >
          View Full Leaderboard
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
