import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CheckCircle2, Music, Clapperboard, Drama, Smile } from "lucide-react";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  eventSlug: string;
  index: number;
  className?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Music: <Music className="h-6 w-6 text-primary-foreground" />,
  Dance: <Clapperboard className="h-6 w-6 text-primary-foreground" />,
  Acting: <Drama className="h-6 w-6 text-primary-foreground" />,
  Comedy: <Smile className="h-6 w-6 text-primary-foreground" />,
};

export function CategoryCard({
  category,
  eventSlug,
  index,
  className,
}: CategoryCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/80">
            {categoryIcons[category.name] ?? (
              <Music className="h-6 w-6 text-primary-foreground" />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Icon overlay */}
        <div className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur-sm">
          {categoryIcons[category.name] ?? (
            <Music className="h-5 w-5 text-primary-foreground" />
          )}
        </div>

        {/* Category name + count */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-bold text-primary-foreground">
            {category.name}
          </h3>
          <Link
            href={`/events/${eventSlug}/categories`}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
          >
            {category.contestant_count} contestants
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Top contestant preview */}
      {category.top_contestant_name && (
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {category.name}
            </span>
            <span className="text-xs font-medium text-foreground">
              {category.top_contestant_name}
            </span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {index + 1 === 1 ? "33x" : `${30 + index}x`}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <span className="text-[10px] text-accent">
              {"Vote most >"}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-accent" />
            <span className="text-xs font-medium text-foreground tabular-nums">
              {category.top_contestant_votes?.toLocaleString() ?? "0"}
            </span>
            <span className="text-[10px] text-muted-foreground">Votes</span>
          </div>
        </div>
      )}
    </div>
  );
}
