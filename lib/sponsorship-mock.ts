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
    logo_url: '/images/sponsor-zenith.jpg',
    website_url: 'https://example.com/zenith',
    status: 'active',
    approved: true,
  },
  {
    id: 'sp-mtn',
    name: 'MTN',
    logo_url: '/images/sponsor-mtn.jpg',
    website_url: 'https://example.com/mtn',
    status: 'active',
    approved: true,
  },
  {
    id: 'sp-coke',
    name: 'Coca-Cola',
    logo_url: '/images/sponsor-cocacola.jpg',
    website_url: 'https://example.com/coke',
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
];

export const mockSponsorPlacements: SponsorPlacement[] = [
  {
    id: 'place-1',
    campaignId: 'camp-1',
    sponsorId: 'sp-zenith',
    eventSlug: 'miss-africa-2026',
    contestantSlug: 'sarah-m',
    slot: 'hero',
    approved: true,
    status: 'active',
  },
  {
    id: 'place-2',
    campaignId: 'camp-2',
    sponsorId: 'sp-mtn',
    eventSlug: 'miss-africa-2026',
    contestantSlug: 'sarah-m',
    slot: 'sidebar',
    approved: true,
    status: 'active',
  },
  {
    id: 'place-3',
    campaignId: 'camp-1',
    sponsorId: 'sp-zenith',
    eventSlug: 'miss-africa-2026',
    contestantSlug: 'zara-johnson',
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
    contestant_slug: 'sarah-m',
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
    contestant_slug: 'sarah-m',
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
