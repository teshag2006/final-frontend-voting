import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { Sponsor } from "@/types/contestant";

interface SponsorsSectionProps {
  sponsors: Sponsor[];
}

export function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  if (!sponsors || sponsors.length === 0) return null;

  const primarySponsor = sponsors[0];
  const otherSponsors = sponsors.slice(1);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Primary sponsor */}
        <div className="flex items-center gap-4">
          <p className="text-base font-bold text-foreground italic">
            Sponsored By:
          </p>
          <div className="flex items-center gap-3">
            {primarySponsor.logo_url && (
              <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border">
                <Image
                  src={primarySponsor.logo_url}
                  alt={primarySponsor.name}
                  fill
                  className="object-contain p-0.5"
                  sizes="40px"
                />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-foreground">
                {primarySponsor.name}
              </p>
              {primarySponsor.website_url && (
                <a
                  href={primarySponsor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Visit {primarySponsor.name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Other sponsors */}
        {otherSponsors.length > 0 && (
          <div className="flex items-center gap-3">
            {otherSponsors.map((sponsor) => (
              <div
                key={sponsor.name}
                className="relative h-12 w-16 overflow-hidden rounded-lg border border-border bg-card p-1"
              >
                <Image
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  fill
                  className="object-contain p-1"
                  sizes="64px"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
