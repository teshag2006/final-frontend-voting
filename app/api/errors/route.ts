import { NextRequest, NextResponse } from 'next/server';

type ErrorPayload = {
  message?: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp?: string;
  url?: string;
  [key: string]: unknown;
};

const errorLog: ErrorPayload[] = [];

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as ErrorPayload;

  errorLog.push({
    ...payload,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    logged: true,
    total: errorLog.length,
  });
}

export async function GET() {
  return NextResponse.json({
    count: errorLog.length,
    latest: errorLog.slice(-50),
  });
}

