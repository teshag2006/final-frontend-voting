"use client";

import { SlidersHorizontal } from "lucide-react";
import type { Contestant } from "@/types/contestant";
import { EventContestantCard } from "./event-contestant-card";
import { useState } from "react";

interface ContestantsSectionProps {
  contestants?: Contestant[];
  isActive: boolean;
}

export function ContestantsSection({
  contestants = [],
  isActive,
}: ContestantsSectionProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const categories = contestants.reduce<string[]>((acc, contestant) => {
    const label = String(contestant.category_name ?? "").trim();
    if (!label) return acc;
    if (!acc.includes(label)) acc.push(label);
    return acc;
  }, []);

  const filtered =
    filterCategory === "all"
      ? contestants
      : contestants.filter((c) => c.category_name === filterCategory);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground md:text-2xl">
          Contestants
        </h2>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Filter Cad $</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Filter by category"
          >
            <option value="all">All</option>
            {categories.map((cat, index) => (
              <option key={`${cat}-${index}`} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((contestant) => (
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
