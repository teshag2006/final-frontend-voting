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
import { VotePanel } from "@/components/contestant-profile/vote-panel";
import { GeographicSupport } from "@/components/contestant-profile/geographic-support";
import { VotingHistory } from "@/components/contestant-profile/voting-history";
import { TransparencySecurity } from "@/components/contestant-profile/transparency-security";
import { PublicVerificationBadges } from "@/components/contestant-profile/public-verification-badges";
import { EventStatusGuard } from "@/components/event-status-guard";

import {
  mockContestantProfile,
  mockVotePackages,
  mockGeographicSupport,
} from "@/lib/contestant-profile-mock";
import { getEventBySlug, getContestantsForEvent } from "@/lib/mock-data-generator";
import { getContestantSponsors, getEventSponsors } from "@/lib/sponsorship-mock";
import {
  getContestantPublicVerification,
  isContestantPublicProfileVisible,
} from "@/lib/contestant-runtime-store";

function buildGalleryPhotos(source: any, eventContestants: any[]) {
  if (Array.isArray(source?.gallery_photos) && source.gallery_photos.length > 0) {
    return source.gallery_photos;
  }

  const candidatePhotos = [
    source?.photo_url,
    source?.image_url,
    ...eventContestants.map((item) => item?.photo_url || item?.image_url),
  ].filter((photo): photo is string => typeof photo === "string" && photo.trim().length > 0);

  const uniquePhotos = Array.from(new Set(candidatePhotos));
  if (uniquePhotos.length === 0) {
    return mockContestantProfile.gallery_photos;
  }

  const desiredCount = Math.max(8, uniquePhotos.length);
  return Array.from({ length: desiredCount }, (_, index) => uniquePhotos[index % uniquePhotos.length]);
}

function normalizeStats(contestant: any) {
  const totalVotes = Number(contestant?.total_votes ?? 0);
  const safeTotalVotes = Number.isFinite(totalVotes) ? totalVotes : 0;
  const paidVotes = Math.round(safeTotalVotes * 0.74);
  const freeVotes = Math.max(0, safeTotalVotes - paidVotes);
  const activitySeed = Math.max(40, Math.round(safeTotalVotes / 95));
  const votesLast7Days = Array.from({ length: 7 }, (_, i) =>
    Math.max(20, Math.round(activitySeed * (0.72 + i * 0.07)))
  );

  return {
    total_votes: safeTotalVotes,
    rank: contestant?.rank ?? 0,
    votes_today: votesLast7Days[6],
    vote_percentage: contestant?.vote_percentage ?? 0,
    rank_movement: 0,
    votes_last_7_days: votesLast7Days,
    paid_votes_last_7_days: votesLast7Days.map((value) => Math.round(value * 0.72)),
    free_votes_last_7_days: votesLast7Days.map((value) => Math.max(0, value - Math.round(value * 0.72))),
    total_paid_votes: paidVotes,
    total_free_votes: freeVotes,
  };
}

function normalizeContestant(source: any, eventSlug: string, eventName: string, eventContestants: any[]) {
  if (!source) {
    return {
      ...mockContestantProfile,
      event_slug: eventSlug,
      event_name: eventName,
      gallery_photos: buildGalleryPhotos(mockContestantProfile, eventContestants),
    };
  }

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
    country: source.country ?? "Pan-African",
    age: source.age ?? null,
    tagline: source.tagline ?? "Contestant",
    bio: source.bio ?? mockContestantProfile.bio,
    gallery_photos: buildGalleryPhotos(source, eventContestants),
    video_thumbnail: source.video_thumbnail ?? source.photo_url ?? source.image_url,
    blockchain_hash: source.blockchain_hash,
    sponsors: Array.isArray(source.sponsors) ? source.sponsors : [],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventSlug: string; contestantSlug: string }>;
}): Promise<Metadata> {
  const { eventSlug, contestantSlug } = await params;
  const event = getEventBySlug(eventSlug);
  const contestants = getContestantsForEvent(eventSlug);
  const selectedContestant = contestants.find((item) => item.slug === contestantSlug);
  const contestant = normalizeContestant(
    selectedContestant,
    eventSlug,
    event?.name ?? "Event",
    contestants
  );

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
  const contestant = normalizeContestant(
    selectedContestant,
    eventSlug,
    event?.name ?? "Event",
    contestants
  );
  const isPubliclyVisible = isContestantPublicProfileVisible(contestantSlug);

  const stats = normalizeStats(contestant);
  const packages = mockVotePackages;
  const geoSupport = mockGeographicSupport;
  const sponsors = getContestantSponsors(eventSlug, contestantSlug);
  const eventSponsors = getEventSponsors(eventSlug);
  const verification = getContestantPublicVerification();

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
      </div>
    );
  }

  if (!isPubliclyVisible) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Profile Pending Admin Approval</h1>
          <p className="mt-2 text-sm text-slate-600">
            This contestant profile is not publicly available until admin review is approved.
          </p>
        </div>
      </div>
    );
  }

  const isActive = event.status === "LIVE" || event.status === "active";
  const sponsorSet =
    sponsors.length > 0
      ? sponsors
      : Array.isArray(contestant.sponsors) && contestant.sponsors.length > 0
        ? contestant.sponsors
        : eventSponsors;

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef2ff_45%,#e7ecff_100%)]">
      <Navbar />

      <ProfileBreadcrumb contestant={contestant} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <section className="space-y-6">
              <ProfileHero contestant={contestant} />
              <PublicVerificationBadges verification={verification} />
              <PhotoGallery
                photos={contestant.gallery_photos || []}
                contestantName={contestant.name}
              />
              <AboutSection contestant={contestant} />
              <HybridVotingBanner />
              <SponsorsSection
                sponsors={sponsorSet}
                eventSlug={eventSlug}
                contestantSlug={contestantSlug}
              />
            </section>

            <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
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
              <GeographicSupport data={geoSupport} />
              <VotingHistory stats={stats} />
              <TransparencySecurity />
            </aside>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

