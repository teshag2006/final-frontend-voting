import { Skeleton } from "@/components/ui/skeleton";

export function ContestantCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Image Skeleton */}
      <Skeleton className="aspect-[3/4] w-full rounded-none" />

      {/* Vote Section Skeleton */}
      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2.5">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function ContestantGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <ContestantCardSkeleton key={i} />
      ))}
    </div>
  );
}
