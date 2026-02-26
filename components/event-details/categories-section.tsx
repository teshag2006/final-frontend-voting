import type { Category } from "@/types/category";
import Link from "next/link";
import { CategoryCard } from "./category-card";
import { ArrowRight } from "lucide-react";

interface CategoriesSectionProps {
  categories?: Category[];
  eventSlug: string;
  isVotingActive?: boolean;
}

export function CategoriesSection({
  categories = [],
  eventSlug,
  isVotingActive = true,
}: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground md:text-2xl">
          Categories
        </h2>
        <Link
          href={`/events/${eventSlug}/categories`}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Browse All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            eventSlug={eventSlug}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
