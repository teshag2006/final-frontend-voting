import type { PublicContestant } from '@/types/public-contestant';
import { ContestantCard } from './contestant-card';

interface ContestantGridProps {
  contestants: PublicContestant[];
  categoryId: string;
}

export function ContestantGrid({ contestants, categoryId }: ContestantGridProps) {
  if (contestants.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 py-12 px-4">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-2">No contestants found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-max">
      {contestants.map((contestant) => (
        <ContestantCard
          key={contestant.id}
          contestant={contestant}
          categoryId={categoryId}
        />
      ))}
    </div>
  );
}
