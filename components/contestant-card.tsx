import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Contestant } from "@/types/contestant";
import { cn } from "@/lib/utils";

interface ContestantCardProps {
  contestant: Contestant;
  className?: string;
}

function formatVotes(votes: number): string {
  if (votes >= 1000) {
    return `${(votes / 1000).toFixed(votes % 1000 === 0 ? 0 : 1).replace(/\.0$/, ",")}${String(votes).slice(-3)}`;
  }
  return votes.toLocaleString();
}

export function ContestantCard({ contestant, className }: ContestantCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm border border-border transition-all hover:shadow-lg hover:-translate-y-1",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={contestant.photo_url}
          alt={`${contestant.name} - ${contestant.category_name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Rank badge */}
        <span className="absolute bottom-16 left-3 inline-flex items-center rounded-md bg-foreground/70 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
          #{contestant.rank}
        </span>

        {/* Name and category */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-bold text-white truncate">
              {contestant.name}
            </h3>
            {contestant.is_verified && (
              <CheckCircle2 className="h-4 w-4 shrink-0 fill-emerald-500 text-white" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-white/70">{contestant.category_name}</p>
            {contestant.is_verified && (
              <span className="text-[10px] text-white/50">Verified Contestant</span>
            )}
          </div>
        </div>
      </div>

      {/* Vote bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-secondary/50">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-bold text-foreground">
            {contestant.total_votes.toLocaleString()}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            votes
          </span>
        </div>
        <Link
          href={`/vote/${contestant.id}`}
          className="inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-1.5 text-xs font-semibold text-card transition-all hover:bg-foreground/85 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
        >
          Vote Now
        </Link>
      </div>
    </div>
  );
}
