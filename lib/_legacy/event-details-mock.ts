/**
 * Mock data for the Event Details page.
 * Replace with real API calls when backend is ready.
 */

import type { Event, EventStats, LeaderboardEntry, FAQItem } from "@/types/event";
import type { Category } from "@/types/category";
import type { Contestant } from "@/types/contestant";

export const mockEventDetail: Event = {
  id: "evt-002",
  slug: "talents-of-tomorrow",
  name: "Talents of Tomorrow",
  description:
    "Talents of Tomorrow is the ultimate talent show where contestants from all over compete to win your votes. From singers to dancers to comedians and actors, every vote brings them closer to stardom. Vote now and make your favorite shine!",
  tagline:
    "Showcase your talent and vote for the brightest stars in music, dance, acting, comedy, and more!",
  start_date: "2026-03-01T00:00:00Z",
  end_date: "2026-04-02T12:00:00Z",
  status: "active",
  banner_url: "https://picsum.photos/seed/event-hero/1200/800",
  voting_rules: "Voting Rules",
  vote_price: 1.0,
  max_votes_per_transaction: 100,
  revenue_share_disclosure:
    "Contestants receive 50% of revenue from their votes",
  organizer_name: "Talent Media Network",
  location: "Los Angeles, CA",
};

export const mockEventStats: EventStats = {
  total_votes: 1245678,
  total_contestants: 58,
  active_categories: 4,
  votes_today: 23475,
};

export const mockCategories: Category[] = [
  {
    id: "cat-001",
    name: "Music",
    event_id: "evt-002",
    contestant_count: 7,
    image_url: "https://picsum.photos/seed/cat-music/1200/800",
    top_contestant_name: "Abebe Kebede",
    top_contestant_votes: 196480,
  },
  {
    id: "cat-002",
    name: "Dance",
    event_id: "evt-002",
    contestant_count: 5,
    image_url: "https://picsum.photos/seed/cat-dance/1200/800",
    top_contestant_name: "Hana Tesfaye",
    top_contestant_votes: 195480,
  },
  {
    id: "cat-003",
    name: "Acting",
    event_id: "evt-002",
    contestant_count: 4,
    image_url: "https://picsum.photos/seed/cat-acting/1200/800",
    top_contestant_name: "Dawit Bekele",
    top_contestant_votes: 306922,
  },
  {
    id: "cat-004",
    name: "Comedy",
    event_id: "evt-002",
    contestant_count: 3,
    image_url: "https://picsum.photos/seed/cat-comedy/1200/800",
    top_contestant_name: "Selamawit Alemu",
    top_contestant_votes: 196480,
  },
];

export const mockContestantsDetail: Contestant[] = [
  {
    id: "cd-001",
    name: "Abebe Kebede",
    category_name: "Music",
    photo_url: "https://picsum.photos/seed/contestant-anna/1200/800",
    rank: 1,
    total_votes: 325890,
    is_verified: true,
    vote_price: 1.0,
  },
  {
    id: "cd-002",
    name: "Hana Tesfaye",
    category_name: "Dance",
    photo_url: "https://picsum.photos/seed/contestant-james/1200/800",
    rank: 2,
    total_votes: 298120,
    is_verified: true,
    vote_price: 1.0,
  },
  {
    id: "cd-003",
    name: "Dawit Bekele",
    category_name: "Acting",
    photo_url: "https://picsum.photos/seed/contestant-maria/1200/800",
    rank: 3,
    total_votes: 245678,
    is_verified: true,
    vote_price: 1.0,
  },
  {
    id: "cd-004",
    name: "Selamawit Alemu",
    category_name: "Comedy",
    photo_url: "https://picsum.photos/seed/contestant-david/1200/800",
    rank: 4,
    total_votes: 198450,
    is_verified: false,
    vote_price: 1.0,
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    contestant_id: "cd-001",
    name: "Abebe Kebede",
    category_name: "Music",
    total_votes: 325890,
    photo_url: "https://picsum.photos/seed/contestant-anna/1200/800",
  },
  {
    rank: 2,
    contestant_id: "cd-002",
    name: "Hana Tesfaye",
    category_name: "Dance",
    total_votes: 298120,
    photo_url: "https://picsum.photos/seed/contestant-james/1200/800",
  },
  {
    rank: 3,
    contestant_id: "cd-003",
    name: "Dawit Bekele",
    category_name: "Acting",
    total_votes: 245678,
    photo_url: "https://picsum.photos/seed/contestant-maria/1200/800",
  },
  {
    rank: 4,
    contestant_id: "cd-004",
    name: "Selamawit Alemu",
    category_name: "Comedy",
    total_votes: 198450,
    photo_url: "https://picsum.photos/seed/contestant-david/1200/800",
  },
];

export const mockFAQ: FAQItem[] = [
  {
    id: "faq-1",
    question: "How long does voting last?",
    answer:
      "Voting typically lasts for the duration of the event, as specified on the event page. Check the countdown timer for the exact end time.",
  },
  {
    id: "faq-2",
    question: "How much is one vote?",
    answer:
      "The cost per vote varies by event. For this event, each vote costs $1.00. You can purchase multiple votes in a single transaction.",
  },
  {
    id: "faq-3",
    question: "Can I vote multiple times?",
    answer:
      "Yes! You can vote as many times as you like for your favorite contestant. Each vote counts towards their total. The maximum per transaction is 100 votes.",
  },
  {
    id: "faq-4",
    question: "Are votes refundable?",
    answer:
      "Votes are non-refundable once purchased. Please review your selection carefully before confirming your vote.",
  },
  {
    id: "faq-5",
    question: "When are results final?",
    answer:
      "Results are finalized after the voting period ends and all votes are verified on the blockchain. Final results are announced within 24 hours of voting closure.",
  },
];



