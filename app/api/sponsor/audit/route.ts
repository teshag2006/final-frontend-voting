import { NextResponse } from 'next/server';
import { getSponsorAuditTrail } from '@/lib/sponsor-runtime-store';

export async function GET() {
  return NextResponse.json(getSponsorAuditTrail());
}
