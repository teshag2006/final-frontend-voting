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
  const contestant = contestants.find((c) => c.slug === contestantSlug) || mockContestantProfile;
  
  // Use fallback data for other sections
  const stats = mockContestantStats;
  const packages = mockVotePackages;
  const geoSupport = mockGeographicSupport;
  const faq = mockProfileFAQ;
  const related = contestants.filter((c) => c.slug !== contestantSlug);
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
        <ProfileHero contestant={contestant} isActive={isActive} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Photo Gallery */}
          <PhotoGallery contestant={contestant} />

          {/* About Section */}
          <AboutSection contestant={contestant} stats={stats} />

          {/* Hybrid Voting Banner */}
          <HybridVotingBanner contestant={contestant} eventSlug={eventSlug} />

          {/* Voting Panel with Status Guard */}
          <div className="mt-12">
            <EventStatusGuard
              status={event.status}
              eventSlug={eventSlug}
              allowedStatuses={["LIVE", "active"]}
            >
              <VotePanel
                contestant={contestant}
                packages={packages}
                eventSlug={eventSlug}
                contestantSlug={contestantSlug}
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
          <VotingHistory data={stats} />

          {/* Transparency & Security */}
          <TransparencySecurity />

          {/* FAQ */}
          <ProfileFAQ faq={faq} />

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

