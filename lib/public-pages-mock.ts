/**
 * Mock data for all public pages
 * Used for home, events, leaderboards, and contestant profiles
 */

import { ContestantProfile } from '@/types/contestant';
import { Event } from '@/types/event';

// Home page featured events
export const FEATURED_EVENTS: Event[] = [
  {
    id: 'event-featured-1',
    slug: 'miss-africa-2024',
    name: 'Miss Africa 2024',
    description: 'Join millions of voters in selecting the next Miss Africa. Vote for your favorite contestant across multiple categories.',
    tagline: 'Empowering African Beauty & Excellence',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'LIVE',
    banner_url: 'https://images.unsplash.com/photo-1470229722913-7f419344ca51?w=1200&h=600&fit=crop',
    vote_price: 2.5,
    max_votes_per_transaction: 250,
    organizer_name: 'Miss Africa Organization',
    location: 'Lagos, Nigeria',
    season_year: 2024,
    is_live: true,
  },
  {
    id: 'event-featured-2',
    slug: 'mr-africa-2024',
    name: 'Mr Africa 2024',
    description: 'Discover the most outstanding male contestants in Africa. Cast your votes and help crown the next Mr Africa.',
    tagline: 'Celebrating African Manhood & Ambition',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'LIVE',
    banner_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop',
    vote_price: 2.5,
    max_votes_per_transaction: 250,
    organizer_name: 'Mr Africa Organization',
    location: 'Nairobi, Kenya',
    season_year: 2024,
    is_live: true,
  },
];

// Upcoming events
export const UPCOMING_EVENTS: Event[] = [
  {
    id: 'event-upcoming-1',
    slug: 'miss-universe-africa-2024',
    name: 'Miss Universe Africa 2024',
    description: 'The ultimate pageant bringing together the best of African talent.',
    start_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'UPCOMING',
    vote_price: 3.0,
    max_votes_per_transaction: 300,
    organizer_name: 'Miss Universe Africa',
    location: 'Cape Town, South Africa',
    season_year: 2024,
    is_live: false,
  },
  {
    id: 'event-upcoming-2',
    slug: 'mr-continent-2024',
    name: 'Mr Continent 2024',
    description: 'Celebrating excellence and leadership across the African continent.',
    start_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'UPCOMING',
    vote_price: 2.5,
    max_votes_per_transaction: 250,
    organizer_name: 'Mr Continent Organization',
    location: 'Accra, Ghana',
    season_year: 2024,
    is_live: false,
  },
];

// Leaderboard contestants
export const LEADERBOARD_CONTESTANTS: ContestantProfile[] = [
  {
    id: 'contestant-1',
    slug: 'anna-wilson',
    name: 'Anna Wilson',
    event_slug: 'miss-africa-2024',
    event_name: 'Miss Africa 2024',
    category_name: 'Beauty & Grace',
    photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
    rank: 1,
    total_votes: 325890,
    is_verified: true,
    vote_price: 2.5,
    status: 'active',
    country: 'Nigeria',
    age: 24,
    bio: 'Passionate about education and women empowerment. Miss Africa 2024 contestant.',
    total_paid_votes: 298500,
    total_free_votes: 27390,
    votes_today: 4230,
    rank_overall: 1,
    rank_in_category: 1,
    vote_percentage: 26.2,
    gallery_photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
    ],
    sponsors: [
      {
        id: 'sp-brandx',
        name: 'Beauty Brand X',
        logo_url: 'https://via.placeholder.com/200x100?text=BrandX',
        approved: true,
        status: 'active',
      },
    ],
  },
  {
    id: 'contestant-2',
    slug: 'zainab-hassan',
    name: 'Zainab Hassan',
    event_slug: 'miss-africa-2024',
    event_name: 'Miss Africa 2024',
    category_name: 'Talent & Performance',
    photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
    rank: 2,
    total_votes: 298120,
    is_verified: true,
    vote_price: 2.5,
    status: 'active',
    country: 'Kenya',
    age: 26,
    bio: 'Professional dancer and philanthropist committed to youth development.',
    total_paid_votes: 272450,
    total_free_votes: 25670,
    votes_today: 3890,
    rank_overall: 2,
    rank_in_category: 2,
    vote_percentage: 23.9,
    gallery_photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop',
    ],
  },
  {
    id: 'contestant-3',
    slug: 'amara-williams',
    name: 'Amara Williams',
    event_slug: 'miss-africa-2024',
    event_name: 'Miss Africa 2024',
    category_name: 'Social Impact',
    photo_url: 'https://images.unsplash.com/photo-1507876466733-7371d4862f4e?w=400&h=500&fit=crop',
    rank: 3,
    total_votes: 245678,
    is_verified: true,
    vote_price: 2.5,
    status: 'active',
    country: 'Ghana',
    age: 25,
    bio: 'Social entrepreneur focused on sustainable development and community projects.',
    total_paid_votes: 224870,
    total_free_votes: 20808,
    votes_today: 2450,
    rank_overall: 3,
    rank_in_category: 1,
    vote_percentage: 19.8,
    gallery_photos: [],
  },
];

// Home page stats
export const HOME_PAGE_STATS = {
  totalVoters: 2850000,
  totalVotesCast: 48500000,
  totalPlatformRevenue: 12150000,
  activeContestants: 156,
  upcomingEvents: 4,
  liveEvents: 2,
};

// Category data
export const CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Beauty & Grace',
    description: 'Celebrating elegance, style, and poise',
    icon: '✨',
    color: 'rose',
  },
  {
    id: 'cat-2',
    name: 'Talent & Performance',
    description: 'Showcasing unique talents and abilities',
    icon: '🎭',
    color: 'purple',
  },
  {
    id: 'cat-3',
    name: 'Social Impact',
    description: 'Making a difference in communities',
    icon: '🌍',
    color: 'green',
  },
  {
    id: 'cat-4',
    name: 'Physique & Confidence',
    description: 'Fitness, health, and self-assurance',
    icon: '💪',
    color: 'amber',
  },
];
