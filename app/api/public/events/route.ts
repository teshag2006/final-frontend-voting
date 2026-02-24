import { NextRequest, NextResponse } from 'next/server';
import { mockArchivedEvents, mockEvents } from '@/lib/events-mock';

type PublicEventStatus = 'live' | 'upcoming' | 'archived' | 'cancelled';

function normalizeStatus(status: string): PublicEventStatus {
  const value = (status || '').toLowerCase();
  if (value === 'live' || value === 'active') return 'live';
  if (value === 'upcoming' || value === 'coming_soon') return 'upcoming';
  if (value === 'cancelled') return 'cancelled';
  return 'archived';
}

function parseStatuses(raw: string | null): Set<PublicEventStatus> {
  const defaults: PublicEventStatus[] = ['live', 'upcoming', 'archived'];
  if (!raw) return new Set(defaults);

  const allowed = new Set<PublicEventStatus>(['live', 'upcoming', 'archived', 'cancelled']);
  const selected = raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is PublicEventStatus => allowed.has(value as PublicEventStatus));

  return new Set(selected.length ? selected : defaults);
}

export async function GET(request: NextRequest) {
  const statuses = parseStatuses(request.nextUrl.searchParams.get('status'));

  const data = [...mockEvents, ...mockArchivedEvents].filter((event) => {
    const normalized = normalizeStatus(String(event.status || ''));
    return statuses.has(normalized);
  });

  return NextResponse.json({
    data,
    total: data.length,
    filters: {
      status: Array.from(statuses),
    },
  });
}
