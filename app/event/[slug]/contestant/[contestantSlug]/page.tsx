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

// Mock data -- replace with API calls when backend is ready
import {
  mockContestantProfile,
  mockVotePackages,
  mockContestantStats,
  mockGeographicSupport,
  mockProfileFAQ,
  mockRelatedContestants,
} from "@/lib/contestant-profile-mock";

// TODO: Replace with real API calls:
// import { getContestantBySlug, getContestantStats, getVotePackages, getGeographicSupport, getRelatedContestants } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; contestantSlug: string }>;
}): Promise<Metadata> {
  const { slug, contestantSlug } = await params;
  // TODO: const contestant = await getContestantBySlug(slug, contestantSlug);
  const contestant = mockContestantProfile;
  return {
    title: `${contestant.name} | Vote in ${contestant.event_name}`,
    description: `Support ${contestant.name} in ${contestant.event_name}. ${contestant.category_name} contestant from ${contestant.country}. Currently ranked #${contestant.rank} with ${contestant.total_votes.toLocaleString()} votes.`,
    openGraph: {
      title: `${contestant.name} | Vote in ${contestant.event_name}`,
      description: `Support ${contestant.name} - ${contestant.category_name} contestant from ${contestant.country}`,
      images: contestant.photo_url ? [contestant.photo_url] : [],
    },
  };
}

export default async function ContestantProfilePage({
  params,
}: {
  params: Promise<{ slug: string; contestantSlug: string }>;
}) {
  const { slug, contestantSlug } = await params;

  // TODO: Replace with real API calls:
  // const contestant = await getContestantBySlug(slug, contestantSlug);
  // const stats = await getContestantStats(slug, contestantSlug);
  // const packages = await getVotePackages(slug);
  // const geoSupport = await getGeographicSupport(slug, contestantSlug);
  // const faq = await getProfileFAQ(slug);
  // const related = await getRelatedContestants(slug, contestantSlug);

  const contestant = mockContestantProfile;
  const stats = mockContestantStats;
  const packages = mockVotePackages;
  const geoSupport = mockGeographicSupport;
  const faq = mockProfileFAQ;
  const related = mockRelatedContestants;

  const isActive = contestant.status === "active";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Breadcrumb bar */}
      <ProfileBreadcrumb contestant={contestant} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
            {/* Left column */}
            <div className="flex min-w-0 flex-1 flex-col gap-8">
              {/* Hero */}
              <ProfileHero contestant={contestant} />

              {/* Photo Gallery */}
              <PhotoGallery
                photos={contestant.gallery_photos}
                contestantName={contestant.name}
              />

              {/* About */}
              <AboutSection contestant={contestant} />

              {/* Hybrid Voting Info Banner */}
              <HybridVotingBanner />

              {/* Sponsors */}
              {contestant.sponsors && (
                <SponsorsSection sponsors={contestant.sponsors} />
              )}

              {/* Related Contestants */}
              <RelatedContestants
                contestants={related}
                eventSlug={contestant.event_slug}
              />

              {/* FAQ */}
              <ProfileFAQ items={faq} />
            </div>

            {/* Right sidebar */}
            <aside className="flex w-full flex-col gap-6 lg:w-80 lg:shrink-0">
              {/* Vote Panel */}
              <VotePanel
                contestantName={contestant.name}
                eventName={contestant.event_name}
                packages={packages}
                isActive={isActive}
              />

              {/* Geographic Support */}
              <GeographicSupport data={geoSupport} />

              {/* Voting History */}
              <VotingHistory stats={stats} />

              {/* Transparency & Security */}
              <TransparencySecurity />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
