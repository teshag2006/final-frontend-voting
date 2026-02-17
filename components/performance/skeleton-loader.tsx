'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function EventCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <Skeleton className="h-64 w-full" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function EventListingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ContestantCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <Skeleton className="h-80 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function LeaderboardRowSkeleton() {
  return (
    <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200">
      <Skeleton className="h-6" />
      <Skeleton className="h-6" />
      <Skeleton className="h-6" />
      <Skeleton className="h-6" />
      <Skeleton className="h-6" />
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 font-semibold border-b border-gray-200">
        <div>Rank</div>
        <div>Contestant</div>
        <div>Category</div>
        <div>Votes</div>
        <div>Trend</div>
      </div>
      {Array.from({ length: 10 }).map((_, i) => (
        <LeaderboardRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 p-6">
      <Skeleton className="h-6 w-1/4 mb-6" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
