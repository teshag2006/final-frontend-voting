import { NextRequest, NextResponse } from 'next/server';
import { getCategoriesForEvent } from '@/lib/mock-data-generator';
import { mockEvents } from '@/lib/events-mock';

function toPublicCategory(category: ReturnType<typeof getCategoriesForEvent>[number], eventName: string) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    event_name: eventName,
    contestant_count: category.contestant_count,
    image_url: category.image_url,
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await context.params;

  const fallbackEvent = mockEvents[0];
  for (const event of mockEvents) {
    const categories = getCategoriesForEvent(event.slug);
    const match = categories.find((c) => c.id === categoryId || c.slug === categoryId);
    if (match) {
      return NextResponse.json(toPublicCategory(match, event.name));
    }
  }

  // Keep dev stable for synthetic IDs like /category/1
  const fallbackCategory = getCategoriesForEvent(fallbackEvent.slug)[0];
  if (!fallbackCategory) {
    return NextResponse.json({ message: 'Category not found' }, { status: 404 });
  }

  return NextResponse.json(toPublicCategory(fallbackCategory, fallbackEvent.name));
}

