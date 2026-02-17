import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Contestant } from "@/types/contestant";
import { ContestantCard } from "./contestant-card";

interface FeaturedContestantsProps {
  contestants: Contestant[];
}

export function FeaturedContestants({ contestants }: FeaturedContestantsProps) {
  if (contestants.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground lg:text-3xl">
          Featured Contestants
        </h2>
        <Link
          href="/contestants"
          className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          See All
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {contestants.map((contestant) => (
          <ContestantCard key={contestant.id} contestant={contestant} />
        ))}
      </div>
    </section>
  );
}
