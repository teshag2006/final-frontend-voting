'use client';

import { useEffect } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { Sponsor } from "@/types/contestant";
import { sendSponsorClick, sendSponsorImpression } from "@/lib/sponsor-tracking";

interface SponsorsSectionProps {
  sponsors: Sponsor[];
  eventSlug?: string;
  contestantSlug?: string;
}

export function SponsorsSection({ sponsors, eventSlug, contestantSlug }: SponsorsSectionProps) {
  const activeSponsors = (sponsors || []).filter(
    (sponsor) => sponsor && sponsor.approved !== false && sponsor.status !== "paused" && sponsor.status !== "ended"
  );

  useEffect(() => {
    activeSponsors.forEach((sponsor) => {
      if (!sponsor.id) return;
      sendSponsorImpression({
        sponsorId: sponsor.id,
        placementId: sponsor.placementId,
        sourcePage: "contestant_profile",
        eventSlug,
        contestantSlug,
      });
    });
  }, [activeSponsors, eventSlug, contestantSlug]);

  if (activeSponsors.length === 0) return null;

  const primarySponsor = activeSponsors[0];
  const otherSponsors = activeSponsors.slice(1);
  const primaryLogo = primarySponsor.logo_url || primarySponsor.logoUrl;
  const primaryWebsite = primarySponsor.website_url || primarySponsor.websiteUrl;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Primary sponsor */}
        <div className="flex items-center gap-4">
          <p className="text-base font-bold text-foreground italic">
            Sponsored By:
          </p>
          <div className="flex items-center gap-3">
            {primaryLogo && (
              <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border">
                <Image
                  src={primaryLogo}
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
              {primaryWebsite && (
                <a
                  href={primaryWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => {
                    if (!primarySponsor.id) return;
                    sendSponsorClick({
                      sponsorId: primarySponsor.id,
                      placementId: primarySponsor.placementId,
                      sourcePage: "contestant_profile",
                      eventSlug,
                      contestantSlug,
                      targetUrl: primaryWebsite,
                    });
                  }}
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
                key={sponsor.id || sponsor.name}
                className="relative h-12 w-16 overflow-hidden rounded-lg border border-border bg-card p-1"
              >
                <Image
                  src={sponsor.logo_url || sponsor.logoUrl || "/placeholder.svg"}
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
