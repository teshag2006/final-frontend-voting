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
  const headerCategory = {
    name: `${event.name} Categories`,
    event_name: event.name,
    description: "Browse categories and contestants for this event.",
    contestant_count: contestants.length,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <CategoryHeader category={headerCategory} eventSlug={eventSlug} />

        {/* Countdown for upcoming and live events */}
        {(event.status === "UPCOMING" || event.status === "LIVE" || event.status === "active") && (
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
            <CategoryFilters categoryId={categories[0]?.id ?? `${eventSlug}-cat-1`} />
          </Suspense>

          {/* Category Summary */}
          <CategorySummary categoriesCount={categories.length} />

          {/* Categories Grid */}
          <div className="mt-8 space-y-6">
            {categories.map((category) => (
              <section key={category.id} className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">{category.name}</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {contestants
                    .filter((contestant) => contestant.category === category.name)
                    .map((contestant) => (
                      <ContestantListCard
                        key={contestant.id}
                        contestant={{
                          id: contestant.slug || contestant.id,
                          full_name: contestant.name,
                          profile_image_url: contestant.image_url,
                          total_votes: Number(contestant.votes ?? 0),
                          rank: contestant.ranking,
                          country: contestant.country ?? "N/A",
                          is_verified: true,
                        }}
                      />
                    ))}
                </div>
              </section>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12">
            <Pagination currentPage={1} totalPages={1} baseUrl={`/events/${eventSlug}/categories`} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

