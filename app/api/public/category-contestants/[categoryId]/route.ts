import { NextRequest, NextResponse } from 'next/server';
import { getCategoriesForEvent, getContestantsForEvent } from '@/lib/mock-data-generator';
import { mockEvents } from '@/lib/events-mock';

type SortOption = 'total_votes' | 'alphabetical' | 'recent';

type ContestantRow = {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  country: string;
  profile_image_url: string;
  verified: boolean;
  total_votes: number;
  event_slug: string;
};

function resolveCategory(categoryId: string) {
  for (const event of mockEvents) {
    const categories = getCategoriesForEvent(event.slug);
    const category = categories.find((c) => c.id === categoryId || c.slug === categoryId);
    if (category) {
      return { event, category };
    }
  }

  const fallbackEvent = mockEvents[0];
  const fallbackCategory = getCategoriesForEvent(fallbackEvent.slug)[0];
  return fallbackCategory ? { event: fallbackEvent, category: fallbackCategory } : null;
}

function toPublicContestant(source: ReturnType<typeof getContestantsForEvent>[number]): ContestantRow {
  const parts = String(source.name || '').trim().split(/\s+/);
  const first = parts[0] || 'Contestant';
  const last = parts.slice(1).join(' ') || 'Profile';

  return {
    id: source.id,
    slug: source.slug,
    first_name: first,
    last_name: last,
    country: source.country || 'Unknown',
    profile_image_url: source.image_url,
    verified: true,
    total_votes: Number(source.votes || 0),
    event_slug: source.event_slug,
  };
}

function sortContestants(rows: ContestantRow[], sortBy: SortOption) {
  if (sortBy === 'alphabetical') {
    rows.sort((a, b) =>
      `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
    );
    return;
  }

  if (sortBy === 'recent') {
    rows.reverse();
    return;
  }

  rows.sort((a, b) => b.total_votes - a.total_votes);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await context.params;
  const resolved = resolveCategory(categoryId);

  if (!resolved) {
    return NextResponse.json({ data: [], total: 0, page: 1, limit: 20, total_pages: 0 });
  }

  const pageRaw = Number(request.nextUrl.searchParams.get('page') || '1');
  const limitRaw = Number(request.nextUrl.searchParams.get('limit') || '20');
  const sortRaw = (request.nextUrl.searchParams.get('sort') || 'total_votes') as SortOption;
  const country = request.nextUrl.searchParams.get('country') || undefined;

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 20;
  const sortBy: SortOption = ['total_votes', 'alphabetical', 'recent'].includes(sortRaw)
    ? sortRaw
    : 'total_votes';

  const contestants = getContestantsForEvent(resolved.event.slug)
    .filter((c) => c.category.toLowerCase() === resolved.category.name.toLowerCase())
    .map(toPublicContestant);

  const filtered = country
    ? contestants.filter((c) => c.country.toLowerCase() === country.toLowerCase())
    : contestants;

  sortContestants(filtered, sortBy);

  const total = filtered.length;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return NextResponse.json({
    data,
    total,
    page,
    limit,
    total_pages: totalPages,
  });
}

