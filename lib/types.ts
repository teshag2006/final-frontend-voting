export type UserRole = 'admin' | 'contestant' | 'media' | 'voter' | 'sponsor' | 'public';

export interface ApiEnvelope<T> {
  success?: boolean;
  statusCode: number;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
  timestamp?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages?: number;
  total_pages?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface BackendAuthLoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number | string;
    full_name?: string | null;
    email: string;
    role: UserRole;
    avatar_url?: string | null;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  profile?: any;
  preferences?: any;
  createdAt?: string;
}

export interface BackendEvent {
  id: number;
  slug: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  status: string;
  banner_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  voting_start?: string | null;
  voting_end?: string | null;
  registration_start?: string | null;
  registration_end?: string | null;
  voting_rules?: string | null;
  organizer_name?: string | null;
  location?: string | null;
  vote_price?: number | null;
  revenue_share_disclosure?: string | null;
}

export interface UiEvent {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  status: string;
  banner_url?: string;
  start_date?: string;
  end_date?: string;
  voting_start?: string;
  voting_end?: string;
  registration_start?: string;
  registration_end?: string;
  voting_rules?: string;
  organizer_name?: string;
  location?: string;
  vote_price?: number;
  revenue_share_disclosure?: string;
}

export interface BackendCategory {
  id: number;
  event_id?: number;
  name: string;
  description?: string | null;
  slug?: string | null;
}

export interface UiCategory {
  id: string;
  event_id?: string;
  name: string;
  description?: string;
  slug: string;
}

export interface BackendContestant {
  id: number;
  slug?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  profile_image_url?: string | null;
  photo_url?: string | null;
  image_url?: string | null;
  total_votes?: number | null;
  rank?: number | null;
  country?: string | null;
  category_id?: string | number | null;
  category_name?: string | null;
  category?: string | null;
  is_verified?: boolean | null;
}

export interface UiContestant {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  photo_url: string;
  votes: number;
  total_votes: number;
  rank?: number;
  country?: string;
  category_id?: string;
  category?: string;
  category_name?: string;
  is_verified: boolean;
}

export interface BackendLeaderboardEntry {
  contestantId?: string | number;
  contestant_id?: string | number;
  contestantName?: string;
  contestant_name?: string;
  categoryId?: string | number;
  category_id?: string | number;
  categoryName?: string;
  category_name?: string;
  profileImage?: string;
  profile_image_url?: string;
  totalVotes?: number;
  total_votes?: number;
  rank?: number;
}

export interface UiLeaderboardEntry {
  contestantId: string;
  contestantName: string;
  firstName: string;
  lastName: string;
  categoryId?: string;
  categoryName?: string;
  profileImage?: string;
  profileImageUrl: string;
  freeVotes: number;
  paidVotes: number;
  totalVotes: number;
  rank: number;
  votePercentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  last24hChange?: number;
  totalRevenue: number;
  verified: boolean;
}

export interface BackendVoterWallet {
  isPhoneVerified?: boolean;
  is_phone_verified?: boolean;
  phoneNumber?: string;
  phone_number?: string;
  country?: string;
  dailyVotesRemaining?: number;
  daily_votes_remaining?: number;
  maxPerTransaction?: number;
  max_per_transaction?: number;
  paidVotesRemaining?: number;
  paid_votes_remaining?: number;
  totalVotesUsed?: number;
  total_votes_used?: number;
  totalPaidVotesPurchased?: number;
  total_paid_votes_purchased?: number;
  freeVotes?: Array<{
    categoryId: string | number;
    category_id?: string | number;
    categoryName: string;
    category_name?: string;
    remaining: number;
    remaining_votes?: number;
    isUsed?: boolean;
    is_used?: boolean;
  }>;
  [key: string]: unknown;
}

export interface InfluencePoint {
  label: string;
  value: number;
}

export interface SocialPlatformMetric {
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'X' | 'Facebook' | 'Snapchat';
  username: string;
  followers: number;
  engagementRate: number;
  lastUpdated: string;
}

export interface SponsorCampaignTracking {
  id: string;
  contestantSlug: string;
  sponsorName: string;
  campaignStatus:
    | 'draft'
    | 'pending_payment'
    | 'active'
    | 'completed'
    | 'under_review'
    | 'rejected';
  paymentStatus: 'pending_manual' | 'paid' | 'failed';
  deliverablesSubmitted: number;
  deliverablesTotal: number;
  adminNotes: string;
  performanceSummary?: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
}

export interface SponsorDashboardOverview {
  sponsorName: string;
  trustScore: number;
  verificationStatus: 'verified' | 'pending' | string;
  activeCampaigns: number;
  pendingPayments: number;
  campaignPerformanceSummary: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
  };
}

export interface SponsorProfileSettings {
  general: {
    companyName: string;
    logoUrl: string;
    description: string;
    industry: string;
  };
  contact: {
    contactPerson: string;
    email: string;
    emailVerified: boolean;
    phone: string;
    phoneVerified: boolean;
    address: string;
    country: string;
    city: string;
  };
  legal: {
    taxId: string;
    registrationNumber: string;
    documents: string[];
    termsAccepted: boolean;
  };
  security: {
    accountActivity: Array<{ at: string; device: string; ip: string }>;
  };
  profileCompletion: number;
}

export interface MarketplaceContestant {
  id?: string;
  slug: string;
  name: string;
  category: string;
  age: number;
  gender: 'female' | 'male' | 'non_binary' | 'prefer_not_to_say' | string;
  location: {
    country: string;
    city: string;
    region: string;
  };
  expectedSponsorshipUsd: number;
  profileImage: string;
  rank: number;
  votes: number;
  followers: number;
  engagementRate: number;
  engagementQualityScore: number;
  fraudRiskScore: number;
  sds: number;
  tier: 'A' | 'B' | 'C';
  integrityStatus: 'verified' | 'under_review' | 'flagged';
  integrityScore: number;
  trendingScore: number;
  votes7dGrowth: number;
  followers7dGrowth: number;
  sponsored: boolean;
  profileCompletion: number;
  responseRatePct: number;
  deliverableCompletionPct: number;
  readyNow: boolean;
  availableFrom: string;
  socialPlatforms: SocialPlatformMetric[];
  voteTrend7d: InfluencePoint[];
  engagementTrend7d: InfluencePoint[];
}
