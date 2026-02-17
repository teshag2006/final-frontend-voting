export function ContestantCardSkeleton() {
  return (
    <div className="rounded-lg bg-white shadow-sm border border-border overflow-hidden animate-pulse">
      {/* Image */}
      <div className="aspect-[3/4] w-full bg-secondary" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Name and Country */}
        <div className="space-y-2">
          <div className="h-4 bg-secondary rounded w-3/4" />
          <div className="h-3 bg-secondary rounded w-1/2" />
        </div>

        {/* Vote Count */}
        <div className="h-10 bg-secondary rounded" />

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <div className="h-10 bg-secondary rounded flex-1" />
          <div className="h-10 bg-secondary rounded flex-1" />
        </div>
      </div>
    </div>
  );
}

export function ContestantGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-max">
      {Array.from({ length: 8 }).map((_, i) => (
        <ContestantCardSkeleton key={i} />
      ))}
    </div>
  );
}
