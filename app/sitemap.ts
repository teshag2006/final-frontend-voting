import { MetadataRoute } from 'next';
import { getAllEvents } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://votingplatform.com';
  const events = await getAllEvents({ page: 1, limit: 300 });
  const eventItems = events.items;

  // Static pages
  const staticPages = [
    '',
    '/events',
    '/events/archive',
    '/terms',
    '/privacy',
    '/refund-policy',
    '/anti-fraud',
    '/how-it-works',
    '/transparency',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  // Event pages (excluding archived for now)
  const eventPages = eventItems
    .filter((event) => event.status !== 'ARCHIVED')
    .map((event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

  // Archive pages
  const archivePages = eventItems
    .filter((event) => event.status === 'ARCHIVED')
    .map((event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

  return [...staticPages, ...eventPages, ...archivePages];
}

