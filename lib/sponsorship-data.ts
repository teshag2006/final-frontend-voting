import { getAdminSponsorCampaigns, getAdminSponsors, getSponsorCampaignTracking, getSponsorDiscoverContestants, getSponsorsData } from '@/lib/api';

export const mockMarketplaceContestants: any[] = [];
export const mockAdminRevenueSeries: Array<{ month: string; revenue: number; commission: number }> = [];
export const mockIntegritySignals = {
  voteSpikes: [] as Array<{ time: string; value: number }>,
  followerSpikes: [] as Array<{ time: string; value: number }>,
  flaggedContestants: [] as Array<{ slug: string; severity: string; reason: string }>,
  penaltyHistory: [] as Array<{ date: string; contestant: string; action: string }>,
};
export const mockContestantActiveCampaign = {
  sponsorName: 'Unknown',
  countdownDays: 0,
  lockedSocialUsername: false,
  paymentState: 'manual_pending',
  integrityWarning: '',
};

export async function getAdminSponsorshipRegistry() {
  const [sponsors, campaigns] = await Promise.all([
    getAdminSponsors(),
    getAdminSponsorCampaigns(),
  ]);
  return {
    sponsors: sponsors || [],
    campaigns: campaigns || [],
  };
}

export async function getAdminSponsorshipInsights() {
  const contestants = (await getSponsorDiscoverContestants()) || [];
  const tracking = (await getSponsorCampaignTracking()) || [];
  return { contestants, tracking };
}

export async function getContestantSponsorOverview() {
  const sponsors = (await getSponsorsData()) || [];
  const tracking = (await getSponsorCampaignTracking()) || [];
  return { sponsors, tracking };
}
