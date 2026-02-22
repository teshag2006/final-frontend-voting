import type { Sponsor } from '@/types/contestant';
import type { SponsorVisibility } from '@/types/dashboard';

export interface SponsorCampaign {
  id: string;
  sponsorId: string;
  eventSlug: string;
  title: string;
  startDate: string;
  endDate: string;
  budgetUsd: number;
  status: 'draft' | 'active' | 'paused' | 'ended';
}

export type SponsorshipTier = 'A' | 'B' | 'C';
export type IntegrityStatus = 'verified' | 'under_review' | 'flagged';

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

export interface MarketplaceContestant {
  slug: string;
  name: string;
  category: string;
  profileImage: string;
  rank: number;
  votes: number;
  followers: number;
  engagementRate: number;
  sds: number;
  tier: SponsorshipTier;
  integrityStatus: IntegrityStatus;
  integrityScore: number;
  trendingScore: number;
  votes7dGrowth: number;
  followers7dGrowth: number;
  sponsored: boolean;
  socialPlatforms: SocialPlatformMetric[];
  voteTrend7d: InfluencePoint[];
  engagementTrend7d: InfluencePoint[];
}

export interface SponsorCampaignTracking {
  id: string;
  contestantSlug: string;
  sponsorName: string;
  campaignStatus: 'draft' | 'pending_payment' | 'active' | 'completed' | 'under_review' | 'rejected';
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

export interface ContestantSponsorshipOffer {
  id: string;
  sponsorName: string;
  trustBadge: boolean;
  deliverables: string[];
  durationDays: number;
  agreedPrice: number;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ActiveCampaignDeliverable {
  id: string;
  title: string;
  submitted: boolean;
  approved: boolean;
}

export interface ContestantActiveCampaign {
  campaignId: string;
  sponsorName: string;
  lockedSocialUsername: boolean;
  countdownDays: number;
  paymentState: 'manual_pending' | 'paid';
  integrityWarning: string | null;
  deliverables: ActiveCampaignDeliverable[];
}

export interface SponsorDashboardOverview {
  sponsorName: string;
  trustScore: number;
  verificationStatus: 'verified' | 'pending';
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

export interface SponsorPlacement {
  id: string;
  campaignId: string;
  sponsorId: string;
  eventSlug: string;
  contestantSlug: string;
  slot: 'hero' | 'sidebar' | 'gallery' | 'footer';
  approved: boolean;
  status: 'active' | 'paused' | 'ended';
}

export const mockSponsorInventory: Sponsor[] = [
  {
    id: 'sp-zenith',
    name: 'Zenith Bank',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Zenith_Bank_logo.svg/512px-Zenith_Bank_logo.svg.png',
    status: 'active',
    approved: true,
  },
  {
    id: 'sp-mtn',
    name: 'MTN',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/New-mtn-logo.jpg/512px-New-mtn-logo.jpg',
    status: 'active',
    approved: true,
  },
  {
    id: 'sp-coke',
    name: 'Coca-Cola',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/512px-Coca-Cola_logo.svg.png',
    status: 'active',
    approved: true,
  },
  {
    id: 'sp-samsung',
    name: 'Samsung',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/512px-Samsung_Logo.svg.png',
    status: 'active',
    approved: true,
  },
  {
    id: 'sp-airtel',
    name: 'Airtel',
    logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Airtel_logo.svg/512px-Airtel_logo.svg.png',
    status: 'active',
    approved: true,
  },
];

export const mockSponsorCampaigns: SponsorCampaign[] = [
  {
    id: 'camp-1',
    sponsorId: 'sp-zenith',
    eventSlug: 'miss-africa-2026',
    title: 'Miss Africa Banking Partner',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    budgetUsd: 12000,
    status: 'active',
  },
  {
    id: 'camp-2',
    sponsorId: 'sp-mtn',
    eventSlug: 'miss-africa-2026',
    title: 'Connectivity Sponsor',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    budgetUsd: 9000,
    status: 'active',
  },
  {
    id: 'camp-3',
    sponsorId: 'sp-coke',
    eventSlug: 'miss-africa-2026',
    title: 'Beverage Partner',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    budgetUsd: 8500,
    status: 'active',
  },
  {
    id: 'camp-4',
    sponsorId: 'sp-samsung',
    eventSlug: 'miss-africa-2026',
    title: 'Technology Partner',
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    budgetUsd: 11000,
    status: 'active',
  },
];

export const mockSponsorPlacements: SponsorPlacement[] = [
  {
    id: 'place-1',
    campaignId: 'camp-1',
    sponsorId: 'sp-zenith',
    eventSlug: 'miss-africa-2026',
    contestantSlug: 'selam-m',
    slot: 'hero',
    approved: true,
    status: 'active',
  },
  {
    id: 'place-2',
    campaignId: 'camp-2',
    sponsorId: 'sp-mtn',
    eventSlug: 'miss-africa-2026',
    contestantSlug: 'selam-m',
    slot: 'sidebar',
    approved: true,
    status: 'active',
  },
  {
    id: 'place-3',
    campaignId: 'camp-1',
    sponsorId: 'sp-zenith',
    eventSlug: 'miss-africa-2026',
    contestantSlug: 'lulit-bekele',
    slot: 'hero',
    approved: true,
    status: 'active',
  },
];

export const mockSponsorVisibility: SponsorVisibility[] = [
  {
    sponsor_id: 'sp-zenith',
    sponsor_name: 'Zenith Bank',
    event_slug: 'miss-africa-2026',
    contestant_slug: 'selam-m',
    campaign_period: 'Apr 1 - Apr 30',
    placement_slot: 'hero',
    placement_status: 'active',
    approved: true,
    impressions: 45230,
    engagement_metrics: 3420,
    clicks: 1135,
    click_through_rate: 2.51,
  },
  {
    sponsor_id: 'sp-mtn',
    sponsor_name: 'MTN',
    event_slug: 'miss-africa-2026',
    contestant_slug: 'selam-m',
    campaign_period: 'Apr 1 - Apr 30',
    placement_slot: 'sidebar',
    placement_status: 'active',
    approved: true,
    impressions: 38920,
    engagement_metrics: 2890,
    clicks: 986,
    click_through_rate: 2.53,
  },
];

export const mockMarketplaceContestants: MarketplaceContestant[] = [
  {
    slug: 'selam-m',
    name: 'Selam M',
    category: 'Singing',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    rank: 1,
    votes: 560000,
    followers: 920000,
    engagementRate: 8.2,
    sds: 94.8,
    tier: 'A',
    integrityStatus: 'verified',
    integrityScore: 97,
    trendingScore: 91,
    votes7dGrowth: 13.4,
    followers7dGrowth: 6.8,
    sponsored: true,
    socialPlatforms: [
      {
        platform: 'Instagram',
        username: '@sarahm.live',
        followers: 410000,
        engagementRate: 8.9,
        lastUpdated: '2026-02-18T10:25:00Z',
      },
      {
        platform: 'TikTok',
        username: '@sarahm.official',
        followers: 360000,
        engagementRate: 9.4,
        lastUpdated: '2026-02-18T10:25:00Z',
      },
      {
        platform: 'Facebook',
        username: 'Selam M Official',
        followers: 98000,
        engagementRate: 4.9,
        lastUpdated: '2026-02-18T10:25:00Z',
      },
      {
        platform: 'Snapchat',
        username: '@sarahm.snap',
        followers: 74000,
        engagementRate: 6.3,
        lastUpdated: '2026-02-18T10:25:00Z',
      },
    ],
    voteTrend7d: [
      { label: 'D1', value: 68 },
      { label: 'D2', value: 71 },
      { label: 'D3', value: 76 },
      { label: 'D4', value: 79 },
      { label: 'D5', value: 84 },
      { label: 'D6', value: 90 },
      { label: 'D7', value: 96 },
    ],
    engagementTrend7d: [
      { label: 'D1', value: 6.5 },
      { label: 'D2', value: 6.7 },
      { label: 'D3', value: 7.1 },
      { label: 'D4', value: 7.4 },
      { label: 'D5', value: 7.8 },
      { label: 'D6', value: 8.0 },
      { label: 'D7', value: 8.2 },
    ],
  },
  {
    slug: 'dawit-k',
    name: 'Dawit K',
    category: 'Sports',
    profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    rank: 2,
    votes: 435000,
    followers: 680000,
    engagementRate: 7.6,
    sds: 88.2,
    tier: 'A',
    integrityStatus: 'verified',
    integrityScore: 94,
    trendingScore: 87,
    votes7dGrowth: 9.5,
    followers7dGrowth: 5.4,
    sponsored: true,
    socialPlatforms: [
      {
        platform: 'Instagram',
        username: '@davidk.fit',
        followers: 320000,
        engagementRate: 7.1,
        lastUpdated: '2026-02-18T09:00:00Z',
      },
      {
        platform: 'TikTok',
        username: '@davidk.sports',
        followers: 150000,
        engagementRate: 8.3,
        lastUpdated: '2026-02-18T09:00:00Z',
      },
      {
        platform: 'YouTube',
        username: '@davidk',
        followers: 210000,
        engagementRate: 6.8,
        lastUpdated: '2026-02-18T09:00:00Z',
      },
      {
        platform: 'Facebook',
        username: 'Dawit K Fitness',
        followers: 86000,
        engagementRate: 3.9,
        lastUpdated: '2026-02-18T09:00:00Z',
      },
      {
        platform: 'Snapchat',
        username: '@davidk.snap',
        followers: 51000,
        engagementRate: 5.2,
        lastUpdated: '2026-02-18T09:00:00Z',
      },
    ],
    voteTrend7d: [
      { label: 'D1', value: 60 },
      { label: 'D2', value: 61 },
      { label: 'D3', value: 65 },
      { label: 'D4', value: 69 },
      { label: 'D5', value: 74 },
      { label: 'D6', value: 78 },
      { label: 'D7', value: 84 },
    ],
    engagementTrend7d: [
      { label: 'D1', value: 6.0 },
      { label: 'D2', value: 6.2 },
      { label: 'D3', value: 6.5 },
      { label: 'D4', value: 6.8 },
      { label: 'D5', value: 7.1 },
      { label: 'D6', value: 7.3 },
      { label: 'D7', value: 7.6 },
    ],
  },
  {
    slug: 'abeba-t',
    name: 'Abeba T',
    category: 'Acting',
    profileImage: 'https://randomuser.me/api/portraits/women/32.jpg',
    rank: 3,
    votes: 312000,
    followers: 410000,
    engagementRate: 6.2,
    sds: 74.1,
    tier: 'B',
    integrityStatus: 'under_review',
    integrityScore: 71,
    trendingScore: 58,
    votes7dGrowth: 2.2,
    followers7dGrowth: 1.6,
    sponsored: false,
    socialPlatforms: [
      {
        platform: 'Instagram',
        username: '@annat.actor',
        followers: 250000,
        engagementRate: 6.0,
        lastUpdated: '2026-02-18T12:00:00Z',
      },
      {
        platform: 'TikTok',
        username: '@annat.reels',
        followers: 93000,
        engagementRate: 5.7,
        lastUpdated: '2026-02-18T12:00:00Z',
      },
      {
        platform: 'X',
        username: '@annat',
        followers: 160000,
        engagementRate: 2.8,
        lastUpdated: '2026-02-18T12:00:00Z',
      },
      {
        platform: 'Facebook',
        username: 'Abeba T Actor',
        followers: 42000,
        engagementRate: 3.1,
        lastUpdated: '2026-02-18T12:00:00Z',
      },
      {
        platform: 'Snapchat',
        username: '@annat.snap',
        followers: 37000,
        engagementRate: 4.4,
        lastUpdated: '2026-02-18T12:00:00Z',
      },
    ],
    voteTrend7d: [
      { label: 'D1', value: 52 },
      { label: 'D2', value: 53 },
      { label: 'D3', value: 54 },
      { label: 'D4', value: 54 },
      { label: 'D5', value: 55 },
      { label: 'D6', value: 56 },
      { label: 'D7', value: 57 },
    ],
    engagementTrend7d: [
      { label: 'D1', value: 5.9 },
      { label: 'D2', value: 5.9 },
      { label: 'D3', value: 6.0 },
      { label: 'D4', value: 6.0 },
      { label: 'D5', value: 6.1 },
      { label: 'D6', value: 6.1 },
      { label: 'D7', value: 6.2 },
    ],
  },
  {
    slug: 'yonas-h',
    name: 'Yonas H',
    category: 'Dancing',
    profileImage: 'https://randomuser.me/api/portraits/women/79.jpg',
    rank: 4,
    votes: 268000,
    followers: 290000,
    engagementRate: 5.4,
    sds: 63.9,
    tier: 'C',
    integrityStatus: 'flagged',
    integrityScore: 52,
    trendingScore: 42,
    votes7dGrowth: -1.2,
    followers7dGrowth: -0.4,
    sponsored: false,
    socialPlatforms: [
      {
        platform: 'TikTok',
        username: '@ahmedl.moves',
        followers: 210000,
        engagementRate: 5.8,
        lastUpdated: '2026-02-18T07:10:00Z',
      },
      {
        platform: 'Instagram',
        username: '@ahmedl',
        followers: 80000,
        engagementRate: 4.2,
        lastUpdated: '2026-02-18T07:10:00Z',
      },
      {
        platform: 'Facebook',
        username: 'Yonas H Moves',
        followers: 29000,
        engagementRate: 2.7,
        lastUpdated: '2026-02-18T07:10:00Z',
      },
      {
        platform: 'Snapchat',
        username: '@ahmedl.snap',
        followers: 26000,
        engagementRate: 4.1,
        lastUpdated: '2026-02-18T07:10:00Z',
      },
    ],
    voteTrend7d: [
      { label: 'D1', value: 49 },
      { label: 'D2', value: 48 },
      { label: 'D3', value: 48 },
      { label: 'D4', value: 47 },
      { label: 'D5', value: 46 },
      { label: 'D6', value: 45 },
      { label: 'D7', value: 44 },
    ],
    engagementTrend7d: [
      { label: 'D1', value: 5.8 },
      { label: 'D2', value: 5.7 },
      { label: 'D3', value: 5.6 },
      { label: 'D4', value: 5.5 },
      { label: 'D5', value: 5.5 },
      { label: 'D6', value: 5.4 },
      { label: 'D7', value: 5.4 },
    ],
  },
  {
    slug: 'mimi-a',
    name: 'Mimi A',
    category: 'Fashion',
    profileImage: 'https://randomuser.me/api/portraits/women/24.jpg',
    rank: 5,
    votes: 198000,
    followers: 260000,
    engagementRate: 5.1,
    sds: 61.3,
    tier: 'C',
    integrityStatus: 'verified',
    integrityScore: 89,
    trendingScore: 64,
    votes7dGrowth: 3.1,
    followers7dGrowth: 2.4,
    sponsored: false,
    socialPlatforms: [
      {
        platform: 'Instagram',
        username: '@mimi.style',
        followers: 148000,
        engagementRate: 5.4,
        lastUpdated: '2026-02-18T11:10:00Z',
      },
      {
        platform: 'TikTok',
        username: '@mimi.looks',
        followers: 81000,
        engagementRate: 5.9,
        lastUpdated: '2026-02-18T11:10:00Z',
      },
      {
        platform: 'Facebook',
        username: 'Mimi A Fashion',
        followers: 31000,
        engagementRate: 2.8,
        lastUpdated: '2026-02-18T11:10:00Z',
      },
    ],
    voteTrend7d: [
      { label: 'D1', value: 45 },
      { label: 'D2', value: 46 },
      { label: 'D3', value: 47 },
      { label: 'D4', value: 49 },
      { label: 'D5', value: 50 },
      { label: 'D6', value: 51 },
      { label: 'D7', value: 52 },
    ],
    engagementTrend7d: [
      { label: 'D1', value: 4.5 },
      { label: 'D2', value: 4.6 },
      { label: 'D3', value: 4.8 },
      { label: 'D4', value: 4.9 },
      { label: 'D5', value: 5.0 },
      { label: 'D6', value: 5.0 },
      { label: 'D7', value: 5.1 },
    ],
  },
  {
    slug: 'hana-l',
    name: 'Hana L',
    category: 'Modeling',
    profileImage: 'https://randomuser.me/api/portraits/women/56.jpg',
    rank: 6,
    votes: 172000,
    followers: 225000,
    engagementRate: 4.8,
    sds: 57.6,
    tier: 'C',
    integrityStatus: 'under_review',
    integrityScore: 68,
    trendingScore: 55,
    votes7dGrowth: 1.3,
    followers7dGrowth: 0.9,
    sponsored: false,
    socialPlatforms: [
      {
        platform: 'Instagram',
        username: '@hana.runway',
        followers: 121000,
        engagementRate: 4.9,
        lastUpdated: '2026-02-18T08:40:00Z',
      },
      {
        platform: 'TikTok',
        username: '@hana.vibes',
        followers: 69000,
        engagementRate: 5.2,
        lastUpdated: '2026-02-18T08:40:00Z',
      },
      {
        platform: 'X',
        username: '@hanal',
        followers: 35000,
        engagementRate: 2.2,
        lastUpdated: '2026-02-18T08:40:00Z',
      },
    ],
    voteTrend7d: [
      { label: 'D1', value: 41 },
      { label: 'D2', value: 41 },
      { label: 'D3', value: 42 },
      { label: 'D4', value: 43 },
      { label: 'D5', value: 44 },
      { label: 'D6', value: 45 },
      { label: 'D7', value: 46 },
    ],
    engagementTrend7d: [
      { label: 'D1', value: 4.2 },
      { label: 'D2', value: 4.2 },
      { label: 'D3', value: 4.4 },
      { label: 'D4', value: 4.5 },
      { label: 'D5', value: 4.6 },
      { label: 'D6', value: 4.7 },
      { label: 'D7', value: 4.8 },
    ],
  },
];

export const mockSponsorCampaignTracking: SponsorCampaignTracking[] = [
  {
    id: 'track-001',
    contestantSlug: 'selam-m',
    sponsorName: 'Zenith Bank',
    campaignStatus: 'active',
    paymentStatus: 'paid',
    deliverablesSubmitted: 3,
    deliverablesTotal: 5,
    adminNotes: 'Strong visibility. Keep weekly proof cadence.',
  },
  {
    id: 'track-002',
    contestantSlug: 'abeba-t',
    sponsorName: 'MTN',
    campaignStatus: 'pending_payment',
    paymentStatus: 'pending_manual',
    deliverablesSubmitted: 0,
    deliverablesTotal: 4,
    adminNotes: 'Waiting for manual settlement confirmation.',
  },
  {
    id: 'track-003',
    contestantSlug: 'dawit-k',
    sponsorName: 'Coca-Cola',
    campaignStatus: 'completed',
    paymentStatus: 'paid',
    deliverablesSubmitted: 6,
    deliverablesTotal: 6,
    adminNotes: 'Completed successfully.',
    performanceSummary: {
      impressions: 220430,
      clicks: 7012,
      ctr: 3.18,
    },
  },
];

export const mockContestantOffers: ContestantSponsorshipOffer[] = [
  {
    id: 'offer-001',
    sponsorName: 'Zenith Bank',
    trustBadge: true,
    deliverables: ['2 Feed posts', '1 Story set', '1 Video mention'],
    durationDays: 14,
    agreedPrice: 1800,
    status: 'pending',
  },
  {
    id: 'offer-002',
    sponsorName: 'MTN',
    trustBadge: true,
    deliverables: ['1 Feed post', '2 Stories'],
    durationDays: 10,
    agreedPrice: 1300,
    status: 'pending',
  },
  {
    id: 'offer-003',
    sponsorName: 'Nova Beauty',
    trustBadge: false,
    deliverables: ['2 Story mentions'],
    durationDays: 7,
    agreedPrice: 600,
    status: 'pending',
  },
];

export const mockContestantActiveCampaign: ContestantActiveCampaign = {
  campaignId: 'camp-active-101',
  sponsorName: 'Zenith Bank',
  lockedSocialUsername: true,
  countdownDays: 12,
  paymentState: 'manual_pending',
  integrityWarning: 'Engagement spike detected in the last 24 hours. Monitoring active.',
  deliverables: [
    { id: 'd1', title: 'Feed post #1', submitted: true, approved: true },
    { id: 'd2', title: 'Story set #1', submitted: true, approved: false },
    { id: 'd3', title: 'Feed post #2', submitted: false, approved: false },
    { id: 'd4', title: 'Video mention', submitted: false, approved: false },
  ],
};

export const mockSponsorDashboardOverview: SponsorDashboardOverview = {
  sponsorName: 'Zenith Bank',
  trustScore: 93,
  verificationStatus: 'verified',
  activeCampaigns: 2,
  pendingPayments: 1,
  campaignPerformanceSummary: {
    impressions: 614200,
    clicks: 18133,
    ctr: 2.95,
    conversions: 1283,
  },
};

export const mockSponsorProfileSettings: SponsorProfileSettings = {
  general: {
    companyName: 'Zenith Bank',
    logoUrl: 'https://picsum.photos/seed/sponsor-zenith/1200/800',
    description: 'Pan-African banking brand supporting youth and creator economy initiatives.',
    industry: 'Finance',
  },
  contact: {
    contactPerson: 'Helen Worku',
    email: 'partnerships@zenith.example',
    emailVerified: true,
    phone: '+251 911 000 321',
    phoneVerified: true,
    address: 'Bole Road, Addis Ababa',
    country: 'Ethiopia',
    city: 'Addis Ababa',
  },
  legal: {
    taxId: 'TIN-8452-001',
    registrationNumber: 'REG-ET-2020-114',
    documents: ['Business Registration.pdf', 'Tax Clearance.pdf'],
    termsAccepted: true,
  },
  security: {
    accountActivity: [
      { at: '2026-02-19 09:12', device: 'Chrome - Windows', ip: '196.188.12.45' },
      { at: '2026-02-18 18:02', device: 'Safari - iOS', ip: '197.156.84.23' },
      { at: '2026-02-18 10:47', device: 'Chrome - Mac', ip: '197.156.84.11' },
    ],
  },
  profileCompletion: 86,
};

export const mockAdminRevenueSeries = [
  { month: 'Sep', revenue: 12400, commission: 1860 },
  { month: 'Oct', revenue: 18100, commission: 2715 },
  { month: 'Nov', revenue: 22300, commission: 3345 },
  { month: 'Dec', revenue: 19800, commission: 2970 },
  { month: 'Jan', revenue: 24400, commission: 3660 },
  { month: 'Feb', revenue: 27100, commission: 4065 },
];

export const mockIntegritySignals = {
  voteSpikes: [
    { time: '00:00', value: 18 },
    { time: '04:00', value: 16 },
    { time: '08:00', value: 23 },
    { time: '12:00', value: 41 },
    { time: '16:00', value: 29 },
    { time: '20:00', value: 34 },
  ],
  followerSpikes: [
    { time: '00:00', value: 7 },
    { time: '04:00', value: 6 },
    { time: '08:00', value: 10 },
    { time: '12:00', value: 21 },
    { time: '16:00', value: 12 },
    { time: '20:00', value: 15 },
  ],
  flaggedContestants: [
    { slug: 'abeba-t', reason: 'Follower velocity anomaly', severity: 'medium' },
    { slug: 'yonas-h', reason: 'Suspicious vote burst', severity: 'high' },
  ],
  penaltyHistory: [
    { date: '2026-02-10', contestant: 'Yonas H', action: 'Tier downgraded B -> C' },
    { date: '2026-02-06', contestant: 'Abeba T', action: 'Integrity score reduced -10' },
  ],
};

export function getContestantSponsors(eventSlug: string, contestantSlug: string): Sponsor[] {
  const activePlacements = mockSponsorPlacements.filter(
    (p) =>
      p.eventSlug === eventSlug &&
      p.contestantSlug === contestantSlug &&
      p.approved &&
      p.status === 'active'
  );

  return activePlacements
    .map((placement) => {
      const sponsor = mockSponsorInventory.find((s) => s.id === placement.sponsorId);
      if (!sponsor) return null;

      return {
        ...sponsor,
        placementId: placement.id,
        slot: placement.slot,
        eventSlug,
        contestantSlug,
      };
    })
    .filter(Boolean) as Sponsor[];
}

export function getEventSponsors(eventSlug: string): Sponsor[] {
  const sponsorIds = new Set(
    mockSponsorCampaigns
      .filter((campaign) => campaign.eventSlug === eventSlug && campaign.status === 'active')
      .map((campaign) => campaign.sponsorId)
  );
  return mockSponsorInventory.filter(
    (sponsor) =>
      sponsor.id &&
      sponsorIds.has(sponsor.id) &&
      sponsor.approved !== false &&
      sponsor.status === 'active'
  );
}

