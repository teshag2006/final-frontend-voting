/**
 * Mock data for vote eligibility
 * Replace with real API calls to GET /public/vote-eligibility/:eventId
 */

import type { VoteEligibility, VoteLimits } from "@/types/vote";

export const mockVoteEligibility: VoteEligibility = {
  country: "ET", // Change to test foreign voters
  freeEligible: true,
  freeUsed: false,
  paidVotesUsed: 45,
  paidVotesRemaining: 255, // max 300 per event
  dailyVotesRemaining: 50, // max 50 per day
  maxPerTransaction: 50,
};

export const mockVoteEligibilityForeign: VoteEligibility = {
  country: "US",
  freeEligible: false, // Foreign voters don't get free vote
  freeUsed: false,
  paidVotesUsed: 100,
  paidVotesRemaining: 200,
  dailyVotesRemaining: 30,
  maxPerTransaction: 50,
};

export const voteLimits: VoteLimits = {
  maxPerEvent: 300,
  maxPerDay: 50,
  maxPerTransaction: 50,
};
