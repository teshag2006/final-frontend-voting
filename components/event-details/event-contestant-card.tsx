import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star, ShieldCheck, Shield } from "lucide-react";
import type { Contestant } from "@/types/contestant";
import { cn } from "@/lib/utils";

interface EventContestantCardProps {
  contestant: Contestant;
  disabled?: boolean;
  className?: string;
}

const rankBadgeColors: Record<number, string> = {
  1: "bg-amber-500 text-primary-foreground",
  2: "bg-slate-400 text-primary-foreground",
  3: "bg-amber-700 text-primary-foreground",
};

const rankIcons: Record<number, React.ReactNode> = {
  1: <Star className="h-3 w-3 fill-current" />,
  3: <Star className="h-3 w-3 fill-current" />,
};

export function EventContestantCard({
  contestant,
  disabled = false,
  className,
}: EventContestantCardProps) {
  const imageSrc =
    (contestant as any).photo_url ||
    (contestant as any).image_url ||
    "/images/placeholder.jpg";
  const totalVotes = Number(
    (contestant as any).total_votes ?? (contestant as any).votes ?? 0
  );
  const categoryName =
    (contestant as any).category_name ?? (contestant as any).category ?? "General";

  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all",
        !disabled && "hover:shadow-md hover:-translate-y-0.5",
        disabled && "opacity-60",
        className
      )}
    >
      {/* Header with photo + rank */}
      <div className="relative flex items-center justify-center px-4 pt-4 pb-2">
        {/* Rank badge */}
        <div
          className={cn(
            "absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
            rankBadgeColors[contestant.rank] ?? "bg-muted text-muted-foreground"
          )}
        >
          {contestant.rank}
        </div>

        {/* Verification icon */}
        <div className="absolute right-3 top-3">
          {contestant.is_verified ? (
            <ShieldCheck className="h-5 w-5 text-accent" />
          ) : (
            <Shield className="h-5 w-5 text-muted-foreground/40" />
          )}
        </div>

        {/* Avatar */}
        <div className="relative h-20 w-20 overflow-hidden rounded-full ring-2 ring-border">
          <Image
            src={imageSrc}
            alt={contestant.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>

        {/* Rank icon decoration */}
        {rankIcons[contestant.rank] && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-primary-foreground">
            {rankIcons[contestant.rank]}
          </div>
        )}
      </div>

      {/* Name and category */}
      <div className="px-4 pb-1 pt-2 text-center">
        <h3 className="text-sm font-bold text-foreground truncate">
          {contestant.name}
        </h3>
        <p className="text-xs text-muted-foreground">{categoryName}</p>
      </div>

      {/* Votes */}
      <div className="px-4 pb-2 text-center">
        <span className="text-2xl font-bold text-foreground tabular-nums">
          {totalVotes.toLocaleString()}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground ml-1">
          Votes
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-1.5 px-4 pb-4">
        {disabled ? (
          <button
            disabled
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground cursor-not-allowed"
          >
            Voting Closed
          </button>
        ) : (
          <Link
            href={`/vote/${contestant.id}`}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition-all hover:bg-accent/90 active:scale-[0.97]"
          >
            En Vote
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
        <Link
          href={`/contestant/${contestant.id}`}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Profile
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
