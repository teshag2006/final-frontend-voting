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
      slug: 'lulit-bekele',
      name: 'Lulit Bekele',
      category: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/45.jpg',
      country: 'Ethiopia',
      bio: 'Passionate about philanthropy and women empowerment.',
      votes: 15234,
      ranking: 1,
      social_links: {
        instagram: 'https://instagram.com/zarajohnson',
        twitter: 'https://twitter.com/zarajohnson',
      },
    },
    {
      id: `${eventSlug}-cont-2`,
      slug: 'mahi-deressa',
      name: 'Mahi Deressa',
      category: 'Grace',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/68.jpg',
      country: 'Kenya',
      bio: 'Dedicated to environmental conservation across Africa.',
      votes: 12456,
      ranking: 2,
      social_links: {
        instagram: 'https://instagram.com/amaraokafor',
        twitter: 'https://twitter.com/amaraokafor',
      },
    },
    {
      id: `${eventSlug}-cont-3`,
      slug: 'rahel-tadesse',
      name: 'Rahel Tadesse',
      category: 'Excellence',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/76.jpg',
      country: 'Nigeria',
      bio: 'Arts advocate and cultural ambassador.',
      votes: 10892,
      ranking: 3,
      social_links: {
        instagram: 'https://instagram.com/nalakamau',
        twitter: 'https://twitter.com/nalakamau',
      },
    },
    {
      id: `${eventSlug}-cont-4`,
      slug: 'bethel-getahun',
      name: 'Bethel Getahun',
      category: 'Talent',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/63.jpg',
      country: 'Ghana',
      bio: 'Award-winning performer and entertainer.',
      votes: 9123,
      ranking: 4,
      social_links: {
        instagram: 'https://instagram.com/siennambatha',
        twitter: 'https://twitter.com/siennambatha',
      },
    },
    {
      id: `${eventSlug}-cont-5`,
      slug: 'eden-alemayehu',
      name: 'Eden Alemayehu',
      category: 'Talent',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/81.jpg',
      country: 'South Africa',
      bio: 'Tech entrepreneur and innovation advocate.',
      votes: 8567,
      ranking: 5,
      social_links: {
        instagram: 'https://instagram.com/venusadomako',
        twitter: 'https://twitter.com/venusadomako',
      },
    },
    {
      id: `${eventSlug}-cont-6`,
      slug: 'sara-teshome',
      name: 'Sara Teshome',
      category: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/52.jpg',
      country: 'Uganda',
      bio: 'Fashion influencer and style icon.',
      votes: 7345,
      ranking: 6,
      social_links: {
        instagram: 'https://instagram.com/crystaladeyemi',
        twitter: 'https://twitter.com/crystaladeyemi',
      },
    },
    {
      id: `${eventSlug}-cont-7`,
      slug: 'helen-hailemariam',
      name: 'Helen Hailemariam',
      category: 'Grace',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/72.jpg',
      country: 'Tanzania',
      bio: 'Youth mentor and community impact leader.',
      votes: 6981,
      ranking: 7,
      social_links: {
        instagram: 'https://instagram.com/lindaopoku',
        twitter: 'https://twitter.com/lindaopoku',
      },
    },
    {
      id: `${eventSlug}-cont-8`,
      slug: 'nahom-tesfaye',
      name: 'Nahom Tesfaye',
      category: 'Excellence',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/men/54.jpg',
      country: 'Rwanda',
      bio: 'Entrepreneur and leadership advocate.',
      votes: 6452,
      ranking: 8,
      social_links: {
        instagram: 'https://instagram.com/kofinartey',
        twitter: 'https://twitter.com/kofinartey',
      },
    },
    {
      id: `${eventSlug}-cont-9`,
      slug: 'hana-girma',
      name: 'Hana Girma',
      category: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/21.jpg',
      country: 'Ethiopia',
      bio: 'Runway coach and beauty pageant mentor.',
      votes: 6231,
      ranking: 9,
      social_links: {
        instagram: 'https://instagram.com/hanagirma',
        twitter: 'https://twitter.com/hanagirma',
      },
    },
    {
      id: `${eventSlug}-cont-10`,
      slug: 'naomi-kariuki',
      name: 'Naomi Kariuki',
      category: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/33.jpg',
      country: 'Kenya',
      bio: 'Beauty creator focused on clean skincare.',
      votes: 6088,
      ranking: 10,
      social_links: {
        instagram: 'https://instagram.com/naomikariuki',
        twitter: 'https://twitter.com/naomikariuki',
      },
    },
    {
      id: `${eventSlug}-cont-11`,
      slug: 'zainab-bello',
      name: 'Zainab Bello',
      category: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/39.jpg',
      country: 'Nigeria',
      bio: 'Beauty campaign ambassador and model.',
      votes: 5874,
      ranking: 11,
      social_links: {
        instagram: 'https://instagram.com/zainabbello',
        twitter: 'https://twitter.com/zainabbello',
      },
    },
    {
      id: `${eventSlug}-cont-12`,
      slug: 'nana-adjei',
      name: 'Nana Adjei',
      category: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/26.jpg',
      country: 'Ghana',
      bio: 'Fashion stylist and pageant consultant.',
      votes: 5620,
      ranking: 12,
      social_links: {
        instagram: 'https://instagram.com/nanaadjei',
        twitter: 'https://twitter.com/nanaadjei',
      },
    },
    {
      id: `${eventSlug}-cont-13`,
      slug: 'thandi-mokoena',
      name: 'Thandi Mokoena',
      category: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/57.jpg',
      country: 'South Africa',
      bio: 'Advocate for inclusive beauty standards.',
      votes: 5445,
      ranking: 13,
      social_links: {
        instagram: 'https://instagram.com/thandimokoena',
        twitter: 'https://twitter.com/thandimokoena',
      },
    },
    {
      id: `${eventSlug}-cont-14`,
      slug: 'aisha-mugenzi',
      name: 'Aisha Mugenzi',
      category: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/31.jpg',
      country: 'Rwanda',
      bio: 'Beauty editor and youth empowerment speaker.',
      votes: 5287,
      ranking: 14,
      social_links: {
        instagram: 'https://instagram.com/aishamugenzi',
        twitter: 'https://twitter.com/aishamugenzi',
      },
    },
    {
      id: `${eventSlug}-cont-15`,
      slug: 'keji-oluwaseyi',
      name: 'Keji Oluwaseyi',
      category: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/43.jpg',
      country: 'Nigeria',
      bio: 'Beauty entrepreneur building local brands.',
      votes: 4974,
      ranking: 15,
      social_links: {
        instagram: 'https://instagram.com/kejioluwaseyi',
        twitter: 'https://twitter.com/kejioluwaseyi',
      },
    },
    {
      id: `${eventSlug}-cont-16`,
      slug: 'linda-nyambura',
      name: 'Linda Nyambura',
      category: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/36.jpg',
      country: 'Kenya',
      bio: 'Skincare educator and social advocate.',
      votes: 4811,
      ranking: 16,
      social_links: {
        instagram: 'https://instagram.com/lindanyambura',
        twitter: 'https://twitter.com/lindanyambura',
      },
    },
    {
      id: `${eventSlug}-cont-17`,
      slug: 'mariam-issoufou',
      name: 'Mariam Issoufou',
      category: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/54.jpg',
      country: 'Niger',
      bio: 'Beauty and confidence coach for young women.',
      votes: 4636,
      ranking: 17,
      social_links: {
        instagram: 'https://instagram.com/mariamissoufou',
        twitter: 'https://twitter.com/mariamissoufou',
      },
    },
    {
      id: `${eventSlug}-cont-18`,
      slug: 'fatima-konde',
      name: 'Fatima Konde',
      category: 'Beauty',
      event_name: event.name,
      event_slug: eventSlug,
      image_url: 'https://randomuser.me/api/portraits/women/65.jpg',
      country: 'Senegal',
      bio: 'Creative director and beauty storyteller.',
      votes: 4412,
      ranking: 18,
      social_links: {
        instagram: 'https://instagram.com/fatimakonde',
        twitter: 'https://twitter.com/fatimakonde',
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
      contestant_count: 12,
      image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&h=800&fit=crop',
      top_contestant_name: 'Lulit Bekele',
      top_contestant_votes: 15234,
    },
    {
      id: `${eventSlug}-cat-2`,
      slug: 'grace',
      name: 'Grace',
      description: 'Poise and graceful presence',
      contestant_count: 8,
      image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&h=800&fit=crop',
      top_contestant_name: 'Mahi Deressa',
      top_contestant_votes: 12456,
    },
    {
      id: `${eventSlug}-cat-3`,
      slug: 'excellence',
      name: 'Excellence',
      description: 'Outstanding achievements and excellence',
      contestant_count: 8,
      image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&h=800&fit=crop',
      top_contestant_name: 'Rahel Tadesse',
      top_contestant_votes: 10892,
    },
    {
      id: `${eventSlug}-cat-4`,
      slug: 'talent',
      name: 'Talent',
      description: 'Exceptional talents and skills',
      contestant_count: 8,
      image_url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&h=800&fit=crop',
      top_contestant_name: 'Bethel Getahun',
      top_contestant_votes: 9123,
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
        contestant_name: 'Lulit Bekele',
        votes_cast: 15,
        amount_spent: 37.50,
        date: '2026-04-15',
      },
      {
        event_slug: 'miss-africa-2026',
        event_name: 'Miss Africa 2026',
        contestant_name: 'Mahi Deressa',
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
    name: 'Lulit Bekele',
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




