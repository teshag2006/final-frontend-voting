"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Contestant } from "@/types/contestant";
import { EventContestantCard } from "./event-contestant-card";
import { useState } from "react";

interface ContestantsSectionProps {
  contestants?: Contestant[];
  isActive: boolean;
  eventSlug: string;
}

export function ContestantsSection({
  contestants = [],
  isActive,
  eventSlug,
}: ContestantsSectionProps) {
  const visibleContestants = [...contestants]
    .sort((a, b) => Number((b as any).votes ?? 0) - Number((a as any).votes ?? 0))
    .slice(0, 8);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground md:text-2xl">
          Contestants
        </h2>

        <div className="flex items-center gap-4">
          <Link
            href={`/events/${eventSlug}/categories?category=all`}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse All
            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {visibleContestants.map((contestant) => (
          <EventContestantCard
            key={contestant.id}
            contestant={contestant}
            disabled={!isActive}
          />
        ))}
      </div>
    </section>
  );
}
