import type { FAQItem } from '@/types/event';
import { getActiveEvent, getEventFAQ } from '@/lib/api';

export const mockProfileFAQ: FAQItem[] = [];

export async function getProfileFAQ(): Promise<FAQItem[]> {
  const active = await getActiveEvent();
  if (!active?.slug) return [];
  const faq = await getEventFAQ(active.slug);
  if (!Array.isArray(faq)) return [];
  return faq.map((row: any, index: number) => ({
    id: String(row.id ?? `faq-${index + 1}`),
    question: String(row.question ?? row.title ?? ''),
    answer: String(row.answer ?? row.description ?? ''),
  }));
}
