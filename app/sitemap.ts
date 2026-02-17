import { MetadataRoute } from 'next';
import { mockEvents } from '@/lib/events-mock';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://votingplatform.com';

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
  const eventPages = mockEvents
    .filter((event) => event.status !== 'ARCHIVED')
    .map((event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

  // Archive pages
  const archivePages = mockEvents
    .filter((event) => event.status === 'ARCHIVED')
    .map((event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

  return [...staticPages, ...eventPages, ...archivePages];
}
