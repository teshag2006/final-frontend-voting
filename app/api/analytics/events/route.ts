import { NextRequest, NextResponse } from 'next/server';

type BatchedAnalyticsEvent = {
  type?: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  timestamp?: number;
  [key: string]: unknown;
};

const batchedEvents: BatchedAnalyticsEvent[] = [];

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    events?: BatchedAnalyticsEvent[];
    sessionId?: string;
  };

  const events = Array.isArray(body.events) ? body.events : [];
  for (const event of events) {
    batchedEvents.push({
      ...event,
      sessionId: body.sessionId || null,
      receivedAt: Date.now(),
    });
  }

  return NextResponse.json({
    success: true,
    accepted: events.length,
    total: batchedEvents.length,
  });
}

export async function GET() {
  return NextResponse.json({
    count: batchedEvents.length,
    latest: batchedEvents.slice(-50),
  });
}

