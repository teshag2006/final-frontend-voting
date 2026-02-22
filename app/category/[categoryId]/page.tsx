import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPublicCategoryInfo, getPublicCategoryContestants } from '@/lib/api';
import { CategoryHeader } from '@/components/public/category-header';
import { SortFilterControls } from '@/components/public/sort-filter-controls';
import { ContestantGrid } from '@/components/public/contestant-grid';
import { Pagination } from '@/components/public/pagination';
import { ContestantGridSkeleton } from '@/components/public/contestant-card-skeleton';
import { Suspense } from 'react';

interface CategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    country?: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const category = await getPublicCategoryInfo(categoryId);

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The category you are looking for does not exist.',
    };
  }

  return {
    title: `${category.name} - Miss & Mr Africa`,
    description: `Browse and vote for contestants in the ${category.name} category. See all ${category.contestant_count} participants.`,
    openGraph: {
      title: `${category.name} - Miss & Mr Africa`,
      description: `Vote for your favorite ${category.name} contestant.`,
    },
  };
}

async function CategoryContent({
  categoryId,
  page,
  sort,
  country,
}: {
  categoryId: string;
  page: number;
  sort: string;
  country?: string;
}) {
  // Fetch category info and contestants in parallel
  const [category, response] = await Promise.all([
    getPublicCategoryInfo(categoryId),
    getPublicCategoryContestants(categoryId, {
      page,
      limit: 20,
      sort: sort as 'total_votes' | 'alphabetical' | 'recent',
      country,
    }),
  ]);

  if (!category) {
    notFound();
  }

  // Get unique countries from all contestants (for filter options)
  // In a real app, this would come from a dedicated API endpoint
  const allCountriesResponse = await getPublicCategoryContestants(categoryId, {
    limit: 1000, // Fetch all to extract countries
  });

  const uniqueCountries = Array.from(new Set<string>(allCountriesResponse.data.map((c: any): string => String(c.country)))).sort();

  return (
    <>
      {/* Header Section */}
      <CategoryHeader category={category} />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Sort & Filter Controls */}
        <div className="mb-8 pb-6 border-b border-border">
          <SortFilterControls
            categoryId={categoryId}
            countries={uniqueCountries}
            currentSort={sort}
            currentCountry={country}
            totalContestants={response.total}
          />
        </div>

        {/* Contestant Grid */}
        {response.data.length > 0 ? (
          <>
            <ContestantGrid
              contestants={response.data}
              categoryId={categoryId}
            />

            {/* Pagination */}
            {response.total_pages > 1 && (
              <Pagination
                currentPage={response.page}
                totalPages={response.total_pages}
                categoryId={categoryId}
                sort={sort !== 'total_votes' ? sort : undefined}
                country={country}
              />
            )}
          </>
        ) : (
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30 py-12 px-4">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground mb-2">
                No contestants found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or check back later.
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { categoryId } = await params;
  const { page = '1', sort = 'total_votes', country } = await searchParams;

  const currentPage = Math.max(1, parseInt(page));
  const validSort = ['total_votes', 'alphabetical', 'recent'].includes(sort)
    ? sort
    : 'total_votes';

  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <CategoryContent
        categoryId={categoryId}
        page={currentPage}
        sort={validSort}
        country={country}
      />
    </Suspense>
  );
}

function CategoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-4 bg-secondary rounded w-24 mb-6 animate-pulse" />
          <div className="h-10 bg-secondary rounded w-1/2 mb-4 animate-pulse" />
          <div className="h-4 bg-secondary rounded w-1/3 animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Controls Skeleton */}
        <div className="mb-8 pb-6 border-b border-border flex justify-between">
          <div className="h-10 bg-secondary rounded w-32 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-10 bg-secondary rounded w-32 animate-pulse" />
            <div className="h-10 bg-secondary rounded w-32 animate-pulse" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <ContestantGridSkeleton />
      </main>
    </div>
  );
}


