import type { UiEvent } from '@/lib/types';
import { getAllEvents } from '@/lib/api';

export const mockEvents: UiEvent[] = [];
export const mockEventStats: Record<string, unknown> = {};
export const mockArchivedEvents: UiEvent[] = [];

export async function getEventsData(options?: { page?: number; limit?: number; status?: string }) {
  const result = await getAllEvents(options);
  return result.items;
}
