// @ts-nocheck
import { Metadata } from 'next';

export function generateEventMetadata(
  event: {
    name: string;
    description?: string;
    slug: string;
    image_url?: string;
    banner_url?: string;
  },
  baseUrl = 'https://votingplatform.com'
): Metadata {
  const imageUrl = event.image_url || event.banner_url || `${baseUrl}/og-image.png`;
  const url = `${baseUrl}/events/${event.slug}`;

  return {
    title: `${event.name} | Voting Platform`,
    description: event.description || `Vote for your favorite in ${event.name}`,
    keywords: ['voting', 'poll', event.name.toLowerCase()],
    openGraph: {
      title: event.name,
      description: event.description || 'Join the voting event',
      url,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: event.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.name,
      description: event.description || 'Join the voting event',
      images: [imageUrl],
    },
  };
}

export function generateContestantMetadata(
  contestant: {
    name: string;
    category?: string;
    description?: string;
    slug: string;
    photo_url?: string;
    event_slug: string;
  },
  baseUrl = 'https://votingplatform.com'
): Metadata {
  const imageUrl = contestant.photo_url || `${baseUrl}/og-image.png`;
  const url = `${baseUrl}/events/${contestant.event_slug}/contestant/${contestant.slug}`;

  return {
    title: `Vote for ${contestant.name} | Voting Platform`,
    description:
      contestant.description ||
      `Vote for ${contestant.name}${contestant.category ? ` in the ${contestant.category} category` : ''}`,
    keywords: ['voting', 'poll', contestant.name.toLowerCase(), contestant.category?.toLowerCase()],
    openGraph: {
      title: `Vote for ${contestant.name}`,
      description:
        contestant.description ||
        `Vote for ${contestant.name}${contestant.category ? ` in the ${contestant.category} category` : ''}`,
      url,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: contestant.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Vote for ${contestant.name}`,
      description: contestant.description || 'Vote now',
      images: [imageUrl],
    },
  };
}

export function generateJsonLd(type: string, data: Record<string, any>) {
  return {
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    }),
  };
}

export const siteConfig = {
  name: 'Voting Platform',
  description: 'Secure blockchain-verified voting platform for events and pageants',
  url: 'https://votingplatform.com',
  ogImage: 'https://votingplatform.com/og-image.png',
  links: {
    twitter: 'https://twitter.com/votingplatform',
    instagram: 'https://instagram.com/votingplatform',
  },
};

