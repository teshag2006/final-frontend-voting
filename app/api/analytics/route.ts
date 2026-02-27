import { NextRequest, NextResponse } from 'next/server';

type AnalyticsPayload = {
  type?: string;
  sessionId?: string;
  timestamp?: number;
  [key: string]: unknown;
};

const analyticsEvents: AnalyticsPayload[] = [];

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as AnalyticsPayload;
  analyticsEvents.push({
    ...payload,
    receivedAt: Date.now(),
  });

  return NextResponse.json({
    success: true,
    queued: analyticsEvents.length,
  });
}

export async function GET() {
  return NextResponse.json({
    count: analyticsEvents.length,
    latest: analyticsEvents.slice(-20),
  });
}

