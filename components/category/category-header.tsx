import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Category } from "@/types/category";

interface CategoryHeaderProps {
  category: Category;
  eventSlug?: string;
}

export function CategoryHeader({ category, eventSlug }: CategoryHeaderProps) {
  const backUrl = eventSlug ? `/events/${eventSlug}` : "/";

  return (
    <div className="mb-8">
      <Link
        href={backUrl}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {eventSlug ? "Event" : "Home"}
      </Link>

      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {category.name}
        </h1>
        {category.event_name && (
          <p className="text-lg text-muted-foreground">{category.event_name}</p>
        )}
      </div>

      {category.description && (
        <p className="mt-3 text-sm text-muted-foreground">{category.description}</p>
      )}

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
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
