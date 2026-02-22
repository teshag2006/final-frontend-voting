'use client';

import { useEffect } from "react";
import Image from "next/image";
import type { Sponsor } from "@/types/contestant";
import { sendSponsorImpression } from "@/lib/sponsor-tracking";

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

  return (
    <section className="rounded-[24px] border border-white/80 bg-white/85 p-5 shadow-[0_20px_45px_-30px_rgba(37,53,118,0.45)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-xl font-semibold text-foreground">
            Sponsored By:
          </p>
          <div className="flex items-center gap-3">
            {primaryLogo && (
              <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border bg-white p-1">
                <Image
                  src={primaryLogo}
                  alt={primarySponsor.name}
                  fill
                  className="object-contain p-1"
                  sizes="48px"
                />
              </div>
            )}
            <div>
              <p className="text-base font-bold text-foreground">
                {primarySponsor.name}
              </p>
            </div>
          </div>
        </div>

        {otherSponsors.length > 0 && (
          <div className="flex items-center gap-3">
            {otherSponsors.map((sponsor) => (
              <div
                key={sponsor.id || sponsor.name}
                className="relative h-12 w-16 overflow-hidden rounded-lg border border-border bg-white p-1"
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
