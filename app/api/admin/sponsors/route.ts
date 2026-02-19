import { NextResponse } from 'next/server';
import { mockSponsorInventory } from '@/lib/sponsorship-mock';

export async function GET() {
  return NextResponse.json(mockSponsorInventory);
}
