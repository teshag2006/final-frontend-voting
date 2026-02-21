/**
 * Mock data for the Contestant Profile page.
 * Replace with real API calls when backend is ready.
 */

import type {
  ContestantProfile,
  VotePackage,
  ContestantStats,
  GeographicSupport,
} from "@/types/contestant";
import type { FAQItem } from "@/types/event";

export const mockContestantProfile: ContestantProfile = {
  id: "c-001",
  slug: "selam-m",
  event_slug: "miss-africa-2026",
  event_name: "Miss Africa 2026",
  name: "Selam M",
  category_name: "Miss Africa",
  photo_url: "https://picsum.photos/seed/contestant-1/1200/800",
  rank: 1,
  total_votes: 57001,
  is_verified: true,
  vote_price: 1.0,
  status: "active",
  country: "Nigeria",
  age: 23,
  bio: "Born and raised in Nairobi, Kenya. Selam M is a passionate advocate for women's empowerment and education. She graduated with a degree in Environmental Science and has dedicated herself to sustainable development, community outreach, and inspiring young women to achieve their dreams. Her vision is to promote education and healthcare initiatives across Africa, bringing positive change and hope to underprivileged communities.",
  tagline: "Contestant",
  blockchain_hash: "#2799.22.336",
  total_paid_votes: 42750,
  total_free_votes: 14251,
  votes_today: 1230,
  rank_overall: 1,
  rank_in_category: 1,
  vote_percentage: 4.58,
  gallery_photos: [
    "https://picsum.photos/seed/gallery-1/1200/800",
    "https://picsum.photos/seed/gallery-2/1200/800",
    "https://picsum.photos/seed/gallery-3/1200/800",
    "https://picsum.photos/seed/gallery-4/1200/800",
    "https://picsum.photos/seed/gallery-5/1200/800",
    "https://picsum.photos/seed/gallery-6/1200/800",
    "https://picsum.photos/seed/gallery-7/1200/800",
    "https://picsum.photos/seed/gallery-8/1200/800",
    "https://picsum.photos/seed/gallery-9/1200/800",
    "https://picsum.photos/seed/gallery-10/1200/800",
  ],
  video_url: "#",
  video_thumbnail: "https://picsum.photos/seed/video-thumb/1200/800",
  sponsors: [
    {
      id: "sp-zenith",
      name: "Zenith Bank",
      logo_url: "https://picsum.photos/seed/sponsor-zenith/1200/800",
      website_url: "#",
      approved: true,
      status: "active",
    },
    {
      id: "sp-mtn",
      name: "MTN",
      logo_url: "https://picsum.photos/seed/sponsor-mtn/1200/800",
      approved: true,
      status: "active",
    },
    {
      id: "sp-coke",
      name: "Coca-Cola",
      logo_url: "https://picsum.photos/seed/sponsor-cocacola/1200/800",
      approved: true,
      status: "active",
    },
  ],
};

export const mockVotePackages: VotePackage[] = [
  { id: "vp-1", votes: 10, price: 1 },
  { id: "vp-2", votes: 20, price: 2 },
  { id: "vp-3", votes: 50, price: 40, popular: true },
  { id: "vp-4", votes: 100, price: 75 },
];

export const mockContestantStats: ContestantStats = {
  total_votes: 57001,
  rank: 1,
  votes_today: 1230,
  vote_percentage: 4.58,
  rank_movement: 0,
  votes_last_7_days: [120, 180, 250, 200, 310, 280, 350],
  paid_votes_last_7_days: [80, 120, 180, 150, 220, 200, 260],
  free_votes_last_7_days: [40, 60, 70, 50, 90, 80, 90],
};

export const mockGeographicSupport: GeographicSupport = {
  batch_amount: 612,
  trust_score: "Excellent",
  fraud_checks_passed: true,
  vpn_filtered: true,
  velocity_clean: true,
};

export const mockProfileFAQ: FAQItem[] = [
  {
    id: "pfaq-1",
    question: "How long does voting last?",
    answer:
      "Voting lasts for the duration of the event, as shown on the countdown timer. Check the event page for exact end dates.",
  },
  {
    id: "pfaq-2",
    question: "How much is one vote?",
    answer:
      "The cost per vote varies by package. You can purchase packages starting from 10 votes for $1 up to 100 votes for $75.",
  },
  {
    id: "pfaq-3",
    question: "Can I vote multiple times?",
    answer:
      "Ethiopian voters receive 1 free SMS-verified vote per event and may purchase additional votes within enforced limits. International voters may purchase votes within limits.",
  },
  {
    id: "pfaq-4",
    question: "Are there vote limits?",
    answer:
      "Yes. Daily, per-event, and per-transaction limits are enforced to ensure fair competition.",
  },
  {
    id: "pfaq-5",
    question: "Is voting secure?",
    answer:
      "Yes. SMS verification, fraud detection systems, and blockchain anchoring protect vote integrity. Every vote is verifiable.",
  },
  {
    id: "pfaq-6",
    question: "Can I see proof of my vote?",
    answer:
      "Yes. Every vote transaction receives a receipt and can be verified publicly via blockchain.",
  },
  {
    id: "pfaq-7",
    question: "Are votes refundable?",
    answer: "No. All vote purchases are final.",
  },
];

export const mockRelatedContestants = [
  {
    id: "c-002",
    slug: "dawit-k",
    name: "Dawit K",
    category_name: "Mr Africa",
    photo_url: "https://picsum.photos/seed/contestant-2/1200/800",
    rank: 2,
    total_votes: 50700,
    is_verified: true,
    vote_price: 1.0,
  },
  {
    id: "c-003",
    slug: "abeba-t",
    name: "Abeba T",
    category_name: "Miss Africa",
    photo_url: "https://picsum.photos/seed/contestant-3/1200/800",
    rank: 3,
    total_votes: 46800,
    is_verified: true,
    vote_price: 1.0,
  },
];



