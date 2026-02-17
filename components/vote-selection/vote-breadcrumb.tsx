import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ContestantProfile } from "@/types/contestant";

interface VoteBreadcrumbProps {
  contestant: ContestantProfile;
  eventSlug: string;
  contestantSlug: string;
}

export function VoteBreadcrumb({
  contestant,
  eventSlug,
  contestantSlug,
}: VoteBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
      <Link
        href="/"
        className="hover:text-foreground transition-colors"
      >
        Home
      </Link>
      <ChevronRight className="h-4 w-4" />
      <Link
        href={`/events/${eventSlug}`}
        className="hover:text-foreground transition-colors"
      >
        {contestant.event_name}
      </Link>
      <ChevronRight className="h-4 w-4" />
      <Link
        href={`/events/${eventSlug}/contestant/${contestantSlug}`}
        className="hover:text-foreground transition-colors"
      >
        {contestant.name}
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="text-foreground font-medium">Vote</span>
    </div>
  );
}
