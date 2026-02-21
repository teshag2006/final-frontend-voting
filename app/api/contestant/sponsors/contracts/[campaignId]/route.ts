import { NextResponse } from 'next/server';
import { getContestantSponsorContract } from '@/lib/contestant-runtime-store';

export async function GET(
  _request: Request,
  context: { params: Promise<{ campaignId: string }> }
) {
  const { campaignId } = await context.params;
  const contract = getContestantSponsorContract(campaignId);
  if (!contract) {
    return NextResponse.json({ message: 'Contract not found' }, { status: 404 });
  }
  return NextResponse.json(contract);
}
