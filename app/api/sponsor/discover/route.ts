import { NextRequest, NextResponse } from 'next/server';
import { mockMarketplaceContestants } from '@/lib/sponsorship-mock';
import { isContestantGender } from '@/lib/contestant-gender';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query')?.trim().toLowerCase() || '';
  const tier = searchParams.get('tier') || 'ALL';
  const gender = searchParams.get('gender') || 'ALL';
  const ageMin = Number(searchParams.get('ageMin') || 0);
  const ageMax = Number(searchParams.get('ageMax') || 0);
  const categories = String(searchParams.get('categories') || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const country = searchParams.get('country')?.trim().toLowerCase() || '';
  const city = searchParams.get('city')?.trim().toLowerCase() || '';
  const region = searchParams.get('region')?.trim().toLowerCase() || '';
  const budgetMin = Number(searchParams.get('budgetMin') || 0);
  const budgetMax = Number(searchParams.get('budgetMax') || 0);
  const sponsoredStatus = searchParams.get('sponsoredStatus') || 'ALL';
  const votesGrowthMin = Number(searchParams.get('votesGrowthMin') || Number.NEGATIVE_INFINITY);
  const followersGrowthMin = Number(searchParams.get('followersGrowthMin') || Number.NEGATIVE_INFINITY);
  const integrityScoreMin = Number(searchParams.get('integrityScoreMin') || 0);
  const integrityScoreMax = Number(searchParams.get('integrityScoreMax') || 100);
  const instagramFollowersMin = Number(searchParams.get('instagramFollowersMin') || 0);
  const tiktokFollowersMin = Number(searchParams.get('tiktokFollowersMin') || 0);
  const youtubeFollowersMin = Number(searchParams.get('youtubeFollowersMin') || 0);
  const xFollowersMin = Number(searchParams.get('xFollowersMin') || 0);
  const facebookFollowersMin = Number(searchParams.get('facebookFollowersMin') || 0);
  const snapchatFollowersMin = Number(searchParams.get('snapchatFollowersMin') || 0);
  const engagementQualityMin = Number(searchParams.get('engagementQualityMin') || 0);
  const fraudRiskMax = Number(searchParams.get('fraudRiskMax') || 100);
  const profileCompletionMin = Number(searchParams.get('profileCompletionMin') || 0);
  const responseRateMin = Number(searchParams.get('responseRateMin') || 0);
  const deliverableCompletionMin = Number(searchParams.get('deliverableCompletionMin') || 0);
  const readyNowOnly = searchParams.get('readyNowOnly') === 'true';
  const availableFrom = searchParams.get('availableFrom');
  const availableTo = searchParams.get('availableTo');
  const trendingOnly = searchParams.get('trendingOnly') === 'true';
  const highIntegrityOnly = searchParams.get('highIntegrityOnly') === 'true';
  const votesMin = Number(searchParams.get('votesMin') || 0);
  const followersMin = Number(searchParams.get('followersMin') || 0);
  const engagementMin = Number(searchParams.get('engagementMin') || 0);
  const industryCategory = searchParams.get('industryCategory')?.trim().toLowerCase() || '';

  const data = mockMarketplaceContestants
    .filter((contestant) => {
      const instagramFollowers = contestant.socialPlatforms.find((item) => item.platform === 'Instagram')?.followers || 0;
      const tiktokFollowers = contestant.socialPlatforms.find((item) => item.platform === 'TikTok')?.followers || 0;
      const youtubeFollowers = contestant.socialPlatforms.find((item) => item.platform === 'YouTube')?.followers || 0;
      const xFollowers = contestant.socialPlatforms.find((item) => item.platform === 'X')?.followers || 0;
      const facebookFollowers = contestant.socialPlatforms.find((item) => item.platform === 'Facebook')?.followers || 0;
      const snapchatFollowers = contestant.socialPlatforms.find((item) => item.platform === 'Snapchat')?.followers || 0;
      const availableDate = new Date(contestant.availableFrom).getTime();
      const availableFromTime = availableFrom ? new Date(availableFrom).getTime() : Number.NaN;
      const availableToTime = availableTo ? new Date(availableTo).getTime() : Number.NaN;

      if (query && !contestant.name.toLowerCase().includes(query)) return false;
      if (tier !== 'ALL' && contestant.tier !== tier) return false;
      if (gender !== 'ALL' && (!isContestantGender(gender) || contestant.gender !== gender)) return false;
      if (ageMin > 0 && contestant.age < ageMin) return false;
      if (ageMax > 0 && contestant.age > ageMax) return false;
      if (categories.length > 0 && !categories.includes(contestant.category.toLowerCase())) return false;
      if (country && contestant.location.country.toLowerCase() !== country) return false;
      if (city && contestant.location.city.toLowerCase() !== city) return false;
      if (region && contestant.location.region.toLowerCase() !== region) return false;
      if (budgetMin > 0 && contestant.expectedSponsorshipUsd < budgetMin) return false;
      if (budgetMax > 0 && contestant.expectedSponsorshipUsd > budgetMax) return false;
      if (sponsoredStatus === 'SPONSORED' && !contestant.sponsored) return false;
      if (sponsoredStatus === 'UNSPONSORED' && contestant.sponsored) return false;
      if (contestant.votes7dGrowth < votesGrowthMin) return false;
      if (contestant.followers7dGrowth < followersGrowthMin) return false;
      if (contestant.integrityScore < integrityScoreMin || contestant.integrityScore > integrityScoreMax) return false;
      if (instagramFollowers < instagramFollowersMin) return false;
      if (tiktokFollowers < tiktokFollowersMin) return false;
      if (youtubeFollowers < youtubeFollowersMin) return false;
      if (xFollowers < xFollowersMin) return false;
      if (facebookFollowers < facebookFollowersMin) return false;
      if (snapchatFollowers < snapchatFollowersMin) return false;
      if (contestant.engagementQualityScore < engagementQualityMin) return false;
      if (contestant.fraudRiskScore > fraudRiskMax) return false;
      if (contestant.profileCompletion < profileCompletionMin) return false;
      if (contestant.responseRatePct < responseRateMin) return false;
      if (contestant.deliverableCompletionPct < deliverableCompletionMin) return false;
      if (readyNowOnly && !contestant.readyNow) return false;
      if (!Number.isNaN(availableFromTime) && availableDate < availableFromTime) return false;
      if (!Number.isNaN(availableToTime) && availableDate > availableToTime) return false;
      if (trendingOnly && contestant.trendingScore < 80) return false;
      if (highIntegrityOnly && contestant.integrityStatus !== 'verified') return false;
      if (votesMin > 0 && contestant.votes < votesMin) return false;
      if (followersMin > 0 && contestant.followers < followersMin) return false;
      if (engagementMin > 0 && contestant.engagementRate < engagementMin) return false;
      if (industryCategory && !contestant.category.toLowerCase().includes(industryCategory)) return false;
      return true;
    })
    .sort((a, b) => b.sds - a.sds);

  return NextResponse.json(data);
}
