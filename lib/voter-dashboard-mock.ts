// Mock data for voter dashboard
// In production, this data would come from the backend API

import type { WalletResponse } from '@/types/wallet';

export interface VoterDashboardData {
  eventName: string;
  isVerified: boolean;
  maskedPhone: string;
  remainingVotes: number;
  freeVotesUsed: number;
  freeVotesLimit: number;
  paidVotesUsed: number;
  totalTransactions: number;
  categories: CategoryWallet[];
  recentActivities: ActivityRecord[];
  device: string;
  lastLogin: string;
  location: string;
  riskStatus: 'low' | 'review' | 'blocked';
  walletData?: WalletResponse;
}

export interface CategoryWallet {
  id: string;
  name: string;
  icon: string;
  freeVoteStatus: 'available' | 'used';
  paidPurchased: number;
  paidUsed: number;
  remainingPaid: number;
  dailyRemaining: number;
  status: 'active' | 'closed' | 'limit-reached';
}

export interface ActivityRecord {
  date: string;
  category: string;
  contestant: string;
  voteType: 'free' | 'paid';
  status: 'confirmed' | 'under-review' | 'failed';
}

export const mockWalletData: WalletResponse = {
  paidVotesRemaining: 12,
  totalPaidVotesPurchased: 20,
  totalVotesUsed: 8,
  isPhoneVerified: true,
  phoneNumber: '+251 9XX XXX 1234',
  freeVotes: [
    {
      categoryId: 'cat-1',
      categoryName: 'Singing',
      isAvailable: true,
      isUsed: false,
      isEligible: true,
    },
    {
      categoryId: 'cat-2',
      categoryName: 'Sports',
      isAvailable: false,
      isUsed: true,
      isEligible: true,
    },
    {
      categoryId: 'cat-3',
      categoryName: 'Acting',
      isAvailable: true,
      isUsed: false,
      isEligible: true,
    },
    {
      categoryId: 'cat-4',
      categoryName: 'Dancing',
      isAvailable: true,
      isUsed: false,
      isEligible: true,
    },
  ],
};

export const mockVoterDashboard: VoterDashboardData = {
  eventName: 'Campus Star 2026',
  isVerified: true,
  maskedPhone: '+251 9XX XXX 123',
  remainingVotes: 7,
  freeVotesUsed: 3,
  freeVotesLimit: 5,
  paidVotesUsed: 8,
  totalTransactions: 4,
  walletData: mockWalletData,
  categories: [
    {
      id: 'singing',
      name: 'Singing Category',
      icon: '🎤',
      freeVoteStatus: 'used',
      paidPurchased: 5,
      paidUsed: 2,
      remainingPaid: 3,
      dailyRemaining: 3,
      status: 'active',
    },
    {
      id: 'sports',
      name: 'Sports Category',
      icon: '⚽',
      freeVoteStatus: 'available',
      paidPurchased: 10,
      paidUsed: 6,
      remainingPaid: 4,
      dailyRemaining: 4,
      status: 'active',
    },
    {
      id: 'acting',
      name: 'Acting Category',
      icon: '🎭',
      freeVoteStatus: 'used',
      paidPurchased: 8,
      paidUsed: 8,
      remainingPaid: 0,
      dailyRemaining: 0,
      status: 'limit-reached',
    },
  ],
  recentActivities: [
    {
      date: 'Today',
      category: 'Singing',
      contestant: 'Contestant A',
      voteType: 'paid',
      status: 'confirmed',
    },
    {
      date: 'Today',
      category: 'Sports',
      contestant: 'Contestant B',
      voteType: 'free',
      status: 'confirmed',
    },
    {
      date: 'Yesterday',
      category: 'Acting',
      contestant: 'Contestant C',
      voteType: 'paid',
      status: 'under-review',
    },
  ],
  device: 'Chrome - Android',
  lastLogin: '2 hours ago',
  location: 'Ethiopia',
  riskStatus: 'low',
};
