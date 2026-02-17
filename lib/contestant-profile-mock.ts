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
  slug: "sarah-m",
  event_slug: "miss-africa-2026",
  event_name: "Miss Africa 2026",
  name: "Sarah M",
  category_name: "Miss Africa",
  photo_url: "/images/contestant-1.jpg",
  rank: 1,
  total_votes: 57001,
  is_verified: true,
  vote_price: 1.0,
  status: "active",
  country: "Nigeria",
  age: 23,
  bio: "Born and raised in Nairobi, Kenya. Sarah M is a passionate advocate for women's empowerment and education. She graduated with a degree in Environmental Science and has dedicated herself to sustainable development, community outreach, and inspiring young women to achieve their dreams. Her vision is to promote education and healthcare initiatives across Africa, bringing positive change and hope to underprivileged communities.",
  tagline: "Contestant",
  blockchain_hash: "#2799.22.336",
  total_paid_votes: 42750,
  total_free_votes: 14251,
  votes_today: 1230,
  rank_overall: 1,
  rank_in_category: 1,
  vote_percentage: 4.58,
  gallery_photos: [
    "/images/gallery-1.jpg",
    "/images/gallery-2.jpg",
    "/images/gallery-3.jpg",
    "/images/gallery-4.jpg",
    "/images/gallery-5.jpg",
    "/images/gallery-6.jpg",
    "/images/gallery-7.jpg",
    "/images/gallery-8.jpg",
    "/images/gallery-9.jpg",
    "/images/gallery-10.jpg",
  ],
  video_url: "#",
  video_thumbnail: "/images/video-thumb.jpg",
  sponsors: [
    {
      name: "Zenith Bank",
      logo_url: "/images/sponsor-zenith.jpg",
      website_url: "#",
    },
    {
      name: "MTN",
      logo_url: "/images/sponsor-mtn.jpg",
    },
    {
      name: "Coca-Cola",
      logo_url: "/images/sponsor-cocacola.jpg",
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
    slug: "david-k",
    name: "David K",
    category_name: "Mr Africa",
    photo_url: "/images/contestant-2.jpg",
    rank: 2,
    total_votes: 50700,
    is_verified: true,
    vote_price: 1.0,
  },
  {
    id: "c-003",
    slug: "anna-t",
    name: "Anna T",
    category_name: "Miss Africa",
    photo_url: "/images/contestant-3.jpg",
    rank: 3,
    total_votes: 46800,
    is_verified: true,
    vote_price: 1.0,
  },
];
