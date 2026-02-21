import Image from "next/image";
import Link from "next/link";
import { Vote, Users, ChevronRight } from "lucide-react";
import type { EventStats } from "@/types/event";
import { cn } from "@/lib/utils";

interface EventTimelineCardProps {
  stats: EventStats;
  eventSlug: string;
  bannerUrl?: string;
  eventName?: string;
  className?: string;
}

export function EventTimelineCard({
  stats,
  eventSlug,
  bannerUrl,
  eventName,
  className,
}: EventTimelineCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className
      )}
    >
      {/* Image header */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Image
          src={bannerUrl || "/images/event-timeline-bg.jpg"}
          alt={eventName ? `${eventName} banner` : "Event timeline"}
          fill
          className="object-cover"
          sizes="320px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        <h3 className="text-base font-bold text-foreground">Event Timeline</h3>

        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Vote className="h-4 w-4 text-accent" />
            <span className="text-sm text-muted-foreground">Total Votes:</span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {stats.total_votes.toLocaleString()}
            </span>
            <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Total Contestants:
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {stats.total_contestants}
            </span>
            <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
          </div>
        </div>

        <Link
          href={`/events/${eventSlug}/leaderboard`}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-all hover:bg-secondary active:scale-[0.97]"
        >
          View Full Leaderboard
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
