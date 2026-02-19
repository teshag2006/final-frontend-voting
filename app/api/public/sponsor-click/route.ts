import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.sponsorId || !body?.sourcePage) {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      trackedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Malformed request' }, { status: 400 });
  }
}
