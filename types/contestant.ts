// Auto-generated lightweight type stubs for missing @/types modules.
// Replace with concrete domain types as needed.

export type Contestant = any;
export type ContestantProfile = any;
export type ContestantStats = any;
export type GeographicSupport = any;

export interface Sponsor {
  id?: string;
  name: string;
  logo_url?: string;
  logoUrl?: string;
  website_url?: string;
  websiteUrl?: string;
  status?: 'draft' | 'active' | 'paused' | 'ended';
  approved?: boolean;
  slot?: string;
  campaign_period?: string;
  eventSlug?: string;
  contestantSlug?: string;
  placementId?: string;
}

export type VotePackage = any;
