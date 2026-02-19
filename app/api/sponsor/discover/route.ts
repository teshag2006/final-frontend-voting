import { NextRequest, NextResponse } from 'next/server';
import { mockMarketplaceContestants } from '@/lib/sponsorship-mock';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query')?.trim().toLowerCase() || '';
  const tier = searchParams.get('tier') || 'ALL';
  const trendingOnly = searchParams.get('trendingOnly') === 'true';
  const highIntegrityOnly = searchParams.get('highIntegrityOnly') === 'true';
  const votesMin = Number(searchParams.get('votesMin') || 0);
  const followersMin = Number(searchParams.get('followersMin') || 0);
  const engagementMin = Number(searchParams.get('engagementMin') || 0);
  const industryCategory = searchParams.get('industryCategory')?.trim().toLowerCase() || '';

  const data = mockMarketplaceContestants
    .filter((contestant) => {
      if (query && !contestant.name.toLowerCase().includes(query)) return false;
      if (tier !== 'ALL' && contestant.tier !== tier) return false;
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
