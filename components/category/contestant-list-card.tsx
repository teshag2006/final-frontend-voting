import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { CategoryContestant } from "@/types/category";
import { cn } from "@/lib/utils";

interface ContestantListCardProps {
  contestant: CategoryContestant;
  className?: string;
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

export function ContestantListCard({
  contestant,
  className,
}: ContestantListCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm border border-border transition-all hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary">
        {contestant.profile_image_url ? (
          <Image
            src={contestant.profile_image_url}
            alt={contestant.full_name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-xs font-semibold text-muted-foreground">
              No Image
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Rank Badge */}
        {contestant.rank && (
          <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-foreground/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
            #{contestant.rank}
          </span>
        )}

        {/* Name & Country */}
        <div className="absolute bottom-3 left-3 right-3 space-y-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-white truncate">
              {contestant.full_name}
            </h3>
            {contestant.is_verified && (
              <CheckCircle2 className="h-4 w-4 shrink-0 fill-emerald-500 text-white" />
            )}
          </div>
          <p className="text-xs text-white/70">{contestant.country}</p>
          {contestant.is_verified && (
            <span className="inline-block text-[10px] text-white/50">
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Vote Section */}
      <div className="flex items-center justify-between gap-2 border-t border-border bg-secondary/50 px-3 py-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-foreground">
            {formatVotes(contestant.total_votes)}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            votes
          </span>
        </div>
        <Link
          href={`/vote/${contestant.id}`}
          className="inline-flex items-center justify-center rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-card transition-all hover:bg-foreground/85 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
        >
          Vote Now
        </Link>
      </div>
    </div>
  );
}
