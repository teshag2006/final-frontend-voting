import { NextRequest, NextResponse } from 'next/server';
import { mockEvents } from '@/lib/events-mock';
import { getContestantsForEvent } from '@/lib/mock-data-generator';

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
  const limitRaw = Number(request.nextUrl.searchParams.get('limit') || '10');
  const categoryId = (request.nextUrl.searchParams.get('categoryId') || '').trim().toLowerCase();
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 50) : 10;

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const allContestants = mockEvents.flatMap((event) => getContestantsForEvent(event.slug));

  const filtered = allContestants
    .filter((item) => {
      const name = String(item.name || '').toLowerCase();
      const category = String(item.category || '').toLowerCase();
      const categoryMatch = !categoryId || categoryId.includes(category);
      return categoryMatch && (name.includes(query) || category.includes(query));
    })
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      rank: item.ranking,
    }));

  return NextResponse.json({ results: filtered });
}

