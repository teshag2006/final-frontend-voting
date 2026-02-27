import { Injectable } from '@nestjs/common';

type Role = 'admin' | 'contestant' | 'media' | 'voter' | 'sponsor';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface Payment {
  paymentId: string;
  receiptNumber: string;
  voteQuantity: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  eventName: string;
  eventSlug?: string;
  contestantSlug?: string;
  purchaseType: 'package' | 'direct';
  createdAt: string;
}

interface VoteEntry {
  id: string;
  eventName: string;
  categoryName: string;
  contestantName: string;
  freeVotes: number;
  paidVotes: number;
  totalVotes: number;
  votedAt: string;
  paymentId?: string;
  receiptNumber?: string;
}

interface VoterState {
  profile: { fullName: string; email: string; phoneNumber: string; phoneVerified: boolean };
  wallet: {
    paidVotesRemaining: number;
    totalPaidVotesPurchased: number;
    totalVotesUsed: number;
    freeVotes: Array<{
      eventSlug: string;
      categoryId: string;
      categoryName: string;
      isEligible: boolean;
      isUsed: boolean;
      isAvailable: boolean;
    }>;
  };
  payments: Payment[];
  votes: VoteEntry[];
}

@Injectable()
export class DataStoreService {
  readonly users: User[] = [
    { id: 'admin-001', email: 'admin@example.com', name: 'Admin User', role: 'admin' },
    { id: 'voter-001', email: 'voter@example.com', name: 'Demo Voter', role: 'voter' },
    { id: 'contestant-001', email: 'contestant@example.com', name: 'Demo Contestant', role: 'contestant' },
    { id: 'sponsor-001', email: 'sponsor@example.com', name: 'Demo Sponsor', role: 'sponsor' },
  ];

  readonly events = [
    { id: 'event-1', slug: 'miss-africa-2026', name: 'Miss Africa 2026', status: 'LIVE', start_date: '2026-04-01T00:00:00Z', end_date: '2026-04-30T21:00:00Z', description: 'Pan-African pageant event', banner_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=400&fit=crop' },
    { id: 'event-3', slug: 'mr-africa-2026', name: 'Mr Africa 2026', status: 'UPCOMING', start_date: '2026-06-01T00:00:00Z', end_date: '2026-06-30T20:00:00Z', description: 'Pan-African male contest', banner_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop' },
  ];

  readonly categories = ['beauty', 'grace', 'excellence', 'talent'].map((slug, i) => ({
    id: `cat-${i + 1}`,
    slug,
    name: slug[0].toUpperCase() + slug.slice(1),
    description: `Category: ${slug}`,
  }));

  readonly contestants = [
    { id: 'cont-1', slug: 'lulit-bekele', name: 'Lulit Bekele', category: 'Beauty', eventSlug: 'miss-africa-2026', votes: 15234, country: 'Ethiopia', image_url: 'https://randomuser.me/api/portraits/women/45.jpg' },
    { id: 'cont-2', slug: 'mahi-deressa', name: 'Mahi Deressa', category: 'Grace', eventSlug: 'miss-africa-2026', votes: 12456, country: 'Kenya', image_url: 'https://randomuser.me/api/portraits/women/68.jpg' },
  ];

  readonly voterByUserId = new Map<string, VoterState>();

  constructor() {
    this.voterByUserId.set('voter-001', {
      profile: { fullName: 'Demo Voter', email: 'voter@example.com', phoneNumber: '', phoneVerified: false },
      wallet: {
        paidVotesRemaining: 0,
        totalPaidVotesPurchased: 0,
        totalVotesUsed: 0,
        freeVotes: this.categories.map((c) => ({
          eventSlug: 'miss-africa-2026',
          categoryId: c.id,
          categoryName: c.name,
          isEligible: false,
          isUsed: false,
          isAvailable: false,
        })),
      },
      payments: [],
      votes: [],
    });
  }

  now() {
    return new Date().toISOString();
  }

  getUser(id: string) {
    return this.users.find((u) => u.id === id);
  }

  getVoterState(userId: string): VoterState {
    if (!this.voterByUserId.has(userId)) {
      this.voterByUserId.set(userId, {
        profile: { fullName: 'Voter', email: `${userId}@example.com`, phoneNumber: '', phoneVerified: false },
        wallet: { paidVotesRemaining: 0, totalPaidVotesPurchased: 0, totalVotesUsed: 0, freeVotes: [] },
        payments: [],
        votes: [],
      });
    }
    return this.voterByUserId.get(userId)!;
  }
}
