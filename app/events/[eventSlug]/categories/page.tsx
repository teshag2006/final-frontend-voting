// @ts-nocheck
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CategoryHeader } from "@/components/category/category-header";
import { CategoryFilters } from "@/components/category/category-filters";
import { CategorySummary } from "@/components/category/category-summary";
import { ContestantListCard } from "@/components/category/contestant-list-card";
import { Pagination } from "@/components/category/pagination";
import { EventCountdown } from "@/components/events/event-countdown";
import { Suspense } from "react";

// Mock data
import { mockCategories } from "@/lib/event-details-mock";
import { mockEvents } from "@/lib/events-mock";
import { getEventBySlug, getCategoriesForEvent, getContestantsForEvent } from "@/lib/mock-data-generator";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}): Promise<Metadata> {
  const { eventSlug } = await params;
  const event = mockEvents.find((e) => e.slug === eventSlug);

  return {
    title: `Categories - ${event?.name || "Event"} | Vote Online`,
    description: `Browse all categories and contestants in ${event?.name}`,
    alternates: {
      canonical: `/events/${eventSlug}/categories`,
    },
  };
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ eventSlug: string }>;
}) {
  const { eventSlug } = await params;
  
  const event = getEventBySlug(eventSlug);
  const categories = getCategoriesForEvent(eventSlug);
  const contestants = getContestantsForEvent(eventSlug);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
      </div>
    );
  }

  const isVotingActive = event.status === "LIVE";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <CategoryHeader event={event} />

        {/* Countdown for upcoming events */}
        {event.status === "UPCOMING" && (
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <EventCountdown
                startDate={event.start_date}
                endDate={event.end_date}
                eventStatus={event.status}
              />
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filters */}
          <Suspense fallback={<div className="h-10" />}>
            <CategoryFilters />
          </Suspense>

          {/* Category Summary */}
          <CategorySummary categoriesCount={categories.length} />

          {/* Categories Grid */}
          <div className="mt-8 space-y-6">
            {categories.map((category) => (
              <ContestantListCard
                key={category.id}
                category={category}
                eventSlug={eventSlug}
                isVotingActive={isVotingActive}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12">
            <Pagination />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

