import { mockEvents } from './events-mock';

// Get event by slug
export function getEventBySlug(slug: string) {
  return mockEvents.find((event) => event.slug === slug) || mockEvents[0];
}

// Generate mock contestants for an event
export function getContestantsForEvent(eventSlug: string) {
  const event = getEventBySlug(eventSlug);
  const baseContestants = [
    {
      id: `${eventSlug}-cont-1`,
      slug: 'zara-johnson',
      name: 'Zara Johnson',
      category_name: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
      bio: 'Passionate about philanthropy and women empowerment.',
      votes: 15234,
      total_votes: 15234,
      rank: 1,
      is_verified: true,
      social_links: {
        instagram: 'https://instagram.com/zarajohnson',
        twitter: 'https://twitter.com/zarajohnson',
      },
    },
    {
      id: `${eventSlug}-cont-2`,
      slug: 'amara-okafor',
      name: 'Amara Okafor',
      category_name: 'Grace',
      event_name: event.name,
      event_slug: eventSlug,
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      bio: 'Dedicated to environmental conservation across Africa.',
      votes: 12456,
      total_votes: 12456,
      rank: 2,
      is_verified: true,
      social_links: {
        instagram: 'https://instagram.com/amaraokafor',
        twitter: 'https://twitter.com/amaraokafor',
      },
    },
    {
      id: `${eventSlug}-cont-3`,
      slug: 'nala-kamau',
      name: 'Nala Kamau',
      category_name: 'Excellence',
      event_name: event.name,
      event_slug: eventSlug,
      photo_url: 'https://images.unsplash.com/photo-1502685382441-f6d1a4a87d07?w=400&h=500&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1502685382441-f6d1a4a87d07?w=400&h=500&fit=crop',
      bio: 'Arts advocate and cultural ambassador.',
      votes: 10892,
      total_votes: 10892,
      rank: 3,
      is_verified: false,
      social_links: {
        instagram: 'https://instagram.com/nalakamau',
        twitter: 'https://twitter.com/nalakamau',
      },
    },
    {
      id: `${eventSlug}-cont-4`,
      slug: 'sienna-mbatha',
      name: 'Sienna Mbatha',
      category_name: 'Talent',
      event_name: event.name,
      event_slug: eventSlug,
      photo_url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=500&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=500&fit=crop',
      bio: 'Award-winning performer and entertainer.',
      votes: 9123,
      total_votes: 9123,
      rank: 4,
      is_verified: true,
      social_links: {
        instagram: 'https://instagram.com/siennambatha',
        twitter: 'https://twitter.com/siennambatha',
      },
    },
    {
      id: `${eventSlug}-cont-5`,
      slug: 'venus-adomako',
      name: 'Venus Adomako',
      category_name: 'Innovation',
      event_name: event.name,
      event_slug: eventSlug,
      photo_url: 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=400&h=500&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=400&h=500&fit=crop',
      bio: 'Tech entrepreneur and innovation advocate.',
      votes: 8567,
      total_votes: 8567,
      rank: 5,
      is_verified: true,
      social_links: {
        instagram: 'https://instagram.com/venusadomako',
        twitter: 'https://twitter.com/venusadomako',
      },
    },
    {
      id: `${eventSlug}-cont-6`,
      slug: 'crystal-adeyemi',
      name: 'Crystal Adeyemi',
      category_name: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
      bio: 'Fashion influencer and style icon.',
      votes: 7345,
      total_votes: 7345,
      rank: 6,
      is_verified: false,
      social_links: {
        instagram: 'https://instagram.com/crystaladeyemi',
        twitter: 'https://twitter.com/crystaladeyemi',
      },
    },
  ];

  return baseContestants;
}

// Generate mock categories for an event
export function getCategoriesForEvent(eventSlug: string) {
  return [
    {
      id: `${eventSlug}-cat-1`,
      slug: 'beauty',
      name: 'Beauty',
      description: 'Celebrate natural beauty and elegance',
      contestant_count: 6,
    },
    {
      id: `${eventSlug}-cat-2`,
      slug: 'grace',
      name: 'Grace',
      description: 'Poise and graceful presence',
      contestant_count: 6,
    },
    {
      id: `${eventSlug}-cat-3`,
      slug: 'excellence',
      name: 'Excellence',
      description: 'Outstanding achievements and excellence',
      contestant_count: 6,
    },
    {
      id: `${eventSlug}-cat-4`,
      slug: 'talent',
      name: 'Talent',
      description: 'Exceptional talents and skills',
      contestant_count: 6,
    },
    {
      id: `${eventSlug}-cat-5`,
      slug: 'innovation',
      name: 'Innovation',
      description: 'Innovative ideas and leadership',
      contestant_count: 6,
    },
  ];
}

// Get voting breakdown for contestant
export function getContestantVotes(contestantSlug: string) {
  return {
    free_votes: 5234,
    paid_votes: 10000,
    total_votes: 15234,
    vote_breakdown: {
      today: 2345,
      this_week: 5678,
      this_month: 15234,
    },
  };
}

// Get mock voter data
export function getVoterData() {
  return {
    id: 'voter_001',
    name: 'Demo Voter',
    email: 'voter@example.com',
    total_votes_cast: 47,
    total_spent: 125.50,
    favorite_category: 'Beauty',
    vote_history: [
      {
        event_slug: 'miss-africa-2026',
        event_name: 'Miss Africa 2026',
        contestant_name: 'Zara Johnson',
        votes_cast: 15,
        amount_spent: 37.50,
        date: '2026-04-15',
      },
      {
        event_slug: 'miss-africa-2026',
        event_name: 'Miss Africa 2026',
        contestant_name: 'Amara Okafor',
        votes_cast: 8,
        amount_spent: 20.00,
        date: '2026-04-10',
      },
      {
        event_slug: 'miss-africa-2025',
        event_name: 'Miss Africa 2025',
        contestant_name: 'Previous Winner',
        votes_cast: 24,
        amount_spent: 68.00,
        date: '2025-04-20',
      },
    ],
  };
}

// Get mock contestant dashboard data
export function getContestantDashboardData() {
  return {
    name: 'Zara Johnson',
    total_votes: 15234,
    ranking: 1,
    events: [
      {
        name: 'Miss Africa 2026',
        slug: 'miss-africa-2026',
        votes: 15234,
        rank: 1,
        prize_pool: '$50,000',
        status: 'LIVE',
      },
      {
        name: 'Miss Africa 2025',
        slug: 'miss-africa-2025',
        votes: 8967,
        rank: 3,
        prize_pool: '$30,000',
        status: 'ARCHIVED',
      },
    ],
    revenue_breakdown: {
      current_month: 1234.56,
      total_earned: 4567.89,
    },
  };
}

// Get mock media dashboard data
export function getMediaDashboardData() {
  return {
    active_events: 2,
    total_votes: 1245678,
    total_contestants: 48,
    total_viewers: 5000000,
    events: mockEvents.slice(0, 2).map((event) => ({
      name: event.name,
      slug: event.slug,
      status: event.status,
      votes: Math.floor(Math.random() * 500000),
      viewers: Math.floor(Math.random() * 2000000),
    })),
  };
}
