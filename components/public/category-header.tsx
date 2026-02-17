import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { PublicCategory } from '@/types/public-contestant';

interface CategoryHeaderProps {
  category: PublicCategory;
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  return (
    <div className="border-b border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-accent hover:text-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-md px-2 py-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Categories
        </Link>

        {/* Header Content */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {category.event_name}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {category.name}
          </h1>
          <p className="text-base text-muted-foreground">
            {category.contestant_count} {category.contestant_count === 1 ? 'contestant' : 'contestants'} participating
          </p>
        </div>
      </div>
    </div>
  );
}
