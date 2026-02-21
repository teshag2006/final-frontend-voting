/**
 * Mock data for development and preview purposes.
 * Replace with real API calls when backend is ready.
 * All data structures match the API contracts defined in types/.
 */

import type { Event, EventSummary } from "@/types/event";
import type { Contestant } from "@/types/contestant";

export const mockEvent: Event = {
  id: "evt-001",
  name: "Vote for Your Favorite Contestant",
  description: "Secure \u00B7 Blockchain Verified \u00B7 Fraud Protected",
  tagline: "Secure \u00B7 Blockchain Verified \u00B7 Fraud Protected",
  start_date: "2026-01-01T00:00:00Z",
  end_date: "2026-03-01T00:00:00Z",
  status: "active",
};

export const mockSummary: EventSummary = {
  total_votes: 1245330,
  total_revenue: 0,
  blockchain_batches: 312,
  active_countries: 42,
  country_codes: ["NG", "KE", "US", "GB"],
};

export const mockContestants: Contestant[] = [
  {
    id: "c-001",
    name: "Selam M",
    category_name: "Miss Africa",
    photo_url: "https://picsum.photos/seed/contestant-1/1200/800",
    rank: 1,
    total_votes: 57000,
    is_verified: true,
  },
  {
    id: "c-002",
    name: "Dawit K",
    category_name: "Mr Africa",
    photo_url: "https://picsum.photos/seed/contestant-2/1200/800",
    rank: 2,
    total_votes: 50700,
    is_verified: true,
  },
  {
    id: "c-003",
    name: "Abeba T",
    category_name: "Miss Africa",
    photo_url: "https://picsum.photos/seed/contestant-3/1200/800",
    rank: 3,
    total_votes: 46800,
    is_verified: true,
  },
];



