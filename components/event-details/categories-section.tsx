import type { Category } from "@/types/category";
import { CategoryCard } from "./category-card";

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
      <h2 className="text-xl font-bold text-foreground md:text-2xl">
        Categories
      </h2>
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
