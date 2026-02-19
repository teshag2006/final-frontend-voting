import { NextRequest, NextResponse } from 'next/server';
import { mockMarketplaceContestants } from '@/lib/sponsorship-mock';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ contestantSlug: string }> }
) {
  const { contestantSlug } = await context.params;
  const contestant = mockMarketplaceContestants.find((item) => item.slug === contestantSlug);
  if (!contestant) {
    return NextResponse.json({ message: 'Contestant not found' }, { status: 404 });
  }
  return NextResponse.json(contestant);
}
