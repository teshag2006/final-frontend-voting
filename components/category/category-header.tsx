import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";

interface CategoryHeaderProps {
  category: Category;
  eventSlug?: string;
  className?: string;
}

export function CategoryHeader({ category, eventSlug: _eventSlug, className }: CategoryHeaderProps) {
  return (
    <div className={cn("grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end", className)}>
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {category.name}
        </h1>
        {category.event_name && (
          <p className="text-base text-muted-foreground">{category.event_name}</p>
        )}
      </div>

      <div className="space-y-2 lg:justify-self-start">
        {category.description ? (
          <p className="text-sm text-muted-foreground">{category.description}</p>
        ) : null}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contestants
          </span>
          <span className="text-lg font-bold text-foreground">
            {category.contestant_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
