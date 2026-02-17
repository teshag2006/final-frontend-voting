import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface RelatedContestant {
  id: string;
  slug: string;
  name: string;
  category_name: string;
  photo_url: string;
  rank: number;
  total_votes: number;
  is_verified: boolean;
}

interface RelatedContestantsProps {
  contestants: RelatedContestant[];
  eventSlug: string;
  currentContestantSlug?: string;
}

export function RelatedContestants({ contestants, eventSlug, currentContestantSlug }: RelatedContestantsProps) {
  if (!contestants || contestants.length === 0) return null;

  // Filter out the current contestant if specified
  const filteredContestants = currentContestantSlug
    ? contestants.filter((c) => c.slug !== currentContestantSlug)
    : contestants;

  if (filteredContestants.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-foreground md:text-2xl">
        Related Contestants
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filteredContestants.map((c) => (
          <Link
            key={c.id}
            href={`/events/${eventSlug}/contestant/${c.slug}`}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-border">
              <Image
                src={c.photo_url}
                alt={c.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {c.name}
                </span>
                {c.is_verified && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">{c.category_name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-foreground tabular-nums">
                #{c.rank}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {c.total_votes.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
