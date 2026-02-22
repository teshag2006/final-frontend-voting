import Link from "next/link";
import Image from "next/image";
import type { Sponsor } from "@/types/contestant";

interface EventSponsorsSectionProps {
  sponsors: Sponsor[];
  eventSlug: string;
}

export function EventSponsorsSection({ sponsors, eventSlug }: EventSponsorsSectionProps) {
  if (!sponsors || sponsors.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Official Event Sponsors</h3>
          <Link href={`/events/${eventSlug}/leaderboard`} className="text-sm text-primary hover:underline">
            View Event Stats
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {sponsors.map((sponsor) => {
            const logo = sponsor.logo_url || sponsor.logoUrl;
            return (
              <div
                key={sponsor.id || sponsor.name}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition hover:border-primary/40"
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border">
                  <Image src={logo || "/favicon.ico"} alt={sponsor.name} fill className="object-contain p-1" sizes="40px" />
                </div>
                <span className="line-clamp-1 text-sm font-medium text-foreground">{sponsor.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
