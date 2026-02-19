// @ts-nocheck
import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProfileBreadcrumb } from "@/components/contestant-profile/profile-breadcrumb";
import { ProfileHero } from "@/components/contestant-profile/profile-hero";
import { PhotoGallery } from "@/components/contestant-profile/photo-gallery";
import { AboutSection } from "@/components/contestant-profile/about-section";
import { HybridVotingBanner } from "@/components/contestant-profile/hybrid-voting-banner";
import { SponsorsSection } from "@/components/contestant-profile/sponsors-section";
import { ProfileFAQ } from "@/components/contestant-profile/profile-faq";
import { RelatedContestants } from "@/components/contestant-profile/related-contestants";
import { VotePanel } from "@/components/contestant-profile/vote-panel";
import { GeographicSupport } from "@/components/contestant-profile/geographic-support";
import { VotingHistory } from "@/components/contestant-profile/voting-history";
import { TransparencySecurity } from "@/components/contestant-profile/transparency-security";
import { EventStatusGuard } from "@/components/event-status-guard";

// Mock data
import {
  mockContestantProfile,
  mockVotePackages,
  mockContestantStats,
  mockGeographicSupport,
  mockProfileFAQ,
  mockRelatedContestants,
} from "@/lib/contestant-profile-mock";
import { mockEvents } from "@/lib/events-mock";
import { getEventBySlug, getContestantsForEvent } from "@/lib/mock-data-generator";
import { getContestantSponsors } from "@/lib/sponsorship-mock";

function normalizeContestant(source: any, eventSlug: string, eventName: string) {
  if (!source) return { ...mockContestantProfile, event_slug: eventSlug, event_name: eventName };

  const totalVotes = Number(source.total_votes ?? source.votes ?? 0);
  const rank = Number(source.rank ?? source.ranking ?? 0);

  return {
    ...mockContestantProfile,
    ...source,
    event_slug: source.event_slug ?? eventSlug,
    event_name: source.event_name ?? eventName,
    category_name: source.category_name ?? source.category ?? mockContestantProfile.category_name,
    photo_url: source.photo_url ?? source.image_url ?? mockContestantProfile.photo_url,
    total_votes: Number.isFinite(totalVotes) ? totalVotes : 0,
    rank: Number.isFinite(rank) ? rank : mockContestantProfile.rank,
    rank_overall: Number.isFinite(rank) ? rank : mockContestantProfile.rank_overall,
    status: source.status ?? mockContestantProfile.status,
    is_verified: source.is_verified ?? true,
    country: source.country ?? mockContestantProfile.country,
    age: source.age ?? mockContestantProfile.age,
    tagline: source.tagline ?? mockContestantProfile.tagline,
    bio: source.bio ?? mockContestantProfile.bio,
    gallery_photos:
      Array.isArray(source.gallery_photos) && source.gallery_photos.length > 0
        ? source.gallery_photos
        : mockContestantProfile.gallery_photos,
    sponsors: Array.isArray(source.sponsors) ? source.sponsors : mockContestantProfile.sponsors,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventSlug: string; contestantSlug: string }>;
}): Promise<Metadata> {
  const { eventSlug, contestantSlug } = await params;
  const event = mockEvents.find((e) => e.slug === eventSlug);
  const contestant = mockContestantProfile;

  return {
    title: `${contestant.name} | Vote in ${event?.name || "Event"}`,
    description: `Support ${contestant.name} in ${event?.name}. ${contestant.category_name} contestant from ${contestant.country}. Currently ranked #${contestant.rank} with ${contestant.total_votes.toLocaleString()} votes.`,
    openGraph: {
      title: `${contestant.name} | Vote in ${event?.name}`,
      description: `Support ${contestant.name} - ${contestant.category_name} contestant`,
      images: contestant.photo_url ? [contestant.photo_url] : [],
    },
    alternates: {
      canonical: `/events/${eventSlug}/contestant/${contestantSlug}`,
    },
  };
}

export default async function ContestantProfilePage({
  params,
}: {
  params: Promise<{ eventSlug: string; contestantSlug: string }>;
}) {
  const { eventSlug, contestantSlug } = await params;

  const event = getEventBySlug(eventSlug);
  const contestants = getContestantsForEvent(eventSlug);
  const selectedContestant = contestants.find((c) => c.slug === contestantSlug);
  const contestant = normalizeContestant(selectedContestant, eventSlug, event?.name ?? "Event");
  
  // Use fallback data for other sections
  const stats = mockContestantStats;
  const packages = mockVotePackages;
  const geoSupport = mockGeographicSupport;
  const faq = mockProfileFAQ;
  const related = contestants
    .filter((c) => c.slug !== contestantSlug)
    .map((c) => normalizeContestant(c, eventSlug, event?.name ?? "Event"));
  const sponsors = getContestantSponsors(eventSlug, contestantSlug);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
      </div>
    );
  }

  const isActive = event.status === "LIVE" || event.status === "active";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Breadcrumb bar */}
      <ProfileBreadcrumb contestant={contestant} eventSlug={eventSlug} />

      <main className="flex-1">
        {/* Hero Section */}
        <ProfileHero contestant={contestant} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Photo Gallery */}
          <PhotoGallery
            photos={contestant.gallery_photos || []}
            contestantName={contestant.name}
          />

          {/* About Section */}
          <AboutSection contestant={contestant} stats={stats} />

          {/* Hybrid Voting Banner */}
          <HybridVotingBanner />

          {/* Voting Panel with Status Guard */}
          <div className="mt-12">
            <EventStatusGuard
              status={event.status}
              eventSlug={eventSlug}
              allowedStatuses={["LIVE", "active"]}
            >
              <VotePanel
                contestantName={contestant.name}
                eventName={event.name}
                packages={packages}
                isActive={isActive}
              />
            </EventStatusGuard>
          </div>

          {/* Geographic Support */}
          <GeographicSupport data={geoSupport} />

          {/* Sponsors Section */}
          <SponsorsSection
            sponsors={sponsors.length > 0 ? sponsors : mockContestantProfile.sponsors}
            eventSlug={eventSlug}
            contestantSlug={contestantSlug}
          />

          {/* Voting History */}
          <VotingHistory stats={stats} />

          {/* Transparency & Security */}
          <TransparencySecurity />

          {/* FAQ */}
          <ProfileFAQ items={faq} />

          {/* Related Contestants */}
          <RelatedContestants
            contestants={related}
            eventSlug={eventSlug}
            currentContestantSlug={contestantSlug}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

