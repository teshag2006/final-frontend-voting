import 'server-only';

import type { SessionUser } from '@/lib/server/session';
import { mockWalletData } from '@/lib/voter-dashboard-mock';

type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';

interface FreeVoteLedger {
  categoryId: string;
  categoryName: string;
  used: boolean;
}

interface PaymentLedger {
  paymentId: string;
  receiptNumber: string;
  eventName: string;
  votesPurchased: number;
  votesRemaining: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  createdAt: string;
  verifiedAt?: string;
}

interface VoteLedger {
  id: string;
  eventName: string;
  categoryId: string;
  categoryName: string;
  contestantName: string;
  isPaid: boolean;
  paidVotes: number;
  freeVotes: number;
  paymentId?: string;
  receiptNumber?: string;
  votedAt: string;
}

interface VoterRuntimeState {
  voterId: string;
  profile: {
    fullName: string;
    email: string;
    phoneNumber: string;
    phoneVerified: boolean;
    googleLinked: boolean;
    createdAt: string;
  };
  freeVotes: FreeVoteLedger[];
  paidVotesRemaining: number;
  totalPaidVotesPurchased: number;
  totalVotesUsed: number;
  payments: PaymentLedger[];
  votes: VoteLedger[];
}

const voterStore = new Map<string, VoterRuntimeState>();

function nowIso() {
  return new Date().toISOString();
}

function mkId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mkReceipt() {
  return `RCPT-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
}

function ensureVoterState(user: SessionUser): VoterRuntimeState {
  const existing = voterStore.get(user.id);
  if (existing) return existing;

  const seeded: VoterRuntimeState = {
    voterId: user.id,
    profile: {
      fullName: user.name || 'Voter',
      email: user.email || '',
      phoneNumber: '',
      phoneVerified: false,
      googleLinked: false,
      createdAt: nowIso(),
    },
    // Free vote slots are allocated only after successful phone OTP verification.
    freeVotes: [],
    paidVotesRemaining: 0,
    totalPaidVotesPurchased: 0,
    totalVotesUsed: 0,
    payments: [],
    votes: [],
  };

  voterStore.set(user.id, seeded);
  return seeded;
}

function toWalletResponse(state: VoterRuntimeState) {
  return {
    paidVotesRemaining: state.paidVotesRemaining,
    totalPaidVotesPurchased: state.totalPaidVotesPurchased,
    totalVotesUsed: state.totalVotesUsed,
    isPhoneVerified: state.profile.phoneVerified,
    phoneNumber: state.profile.phoneNumber,
    freeVotes: state.freeVotes.map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      isEligible: state.profile.phoneVerified,
      isUsed: state.profile.phoneVerified ? item.used : false,
      isAvailable: state.profile.phoneVerified ? !item.used : false,
    })),
  };
}

export function getVoterWallet(user: SessionUser) {
  const state = ensureVoterState(user);
  return toWalletResponse(state);
}

export function verifyVoterPhone(user: SessionUser, phoneNumber: string) {
  const state = ensureVoterState(user);
  state.profile.phoneVerified = true;
  state.profile.phoneNumber = phoneNumber;
  if (state.freeVotes.length === 0) {
    state.freeVotes = (mockWalletData.freeVotes || []).map((item: any) => ({
      categoryId: String(item.categoryId),
      categoryName: String(item.categoryName),
      used: false,
    }));
  }
  return {
    success: true,
    wallet: toWalletResponse(state),
  };
}

export function getVoterProfile(user: SessionUser) {
  const state = ensureVoterState(user);
  return structuredClone(state.profile);
}

export function updateVoterProfile(user: SessionUser, patch: { fullName?: string }) {
  const state = ensureVoterState(user);
  if (patch.fullName && patch.fullName.trim()) {
    state.profile.fullName = patch.fullName.trim();
  }
  return structuredClone(state.profile);
}

export function registerVoterPayment(
  user: SessionUser,
  payload: {
    paymentId: string;
    votesPurchased: number;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    eventName?: string;
    status?: PaymentStatus;
  }
) {
  const state = ensureVoterState(user);
  const paymentId = String(payload.paymentId || '').trim();
  if (!paymentId) {
    throw new Error('paymentId is required');
  }

  const existing = state.payments.find((item) => item.paymentId === paymentId);
  if (existing) {
    return {
      payment: structuredClone(existing),
      wallet: toWalletResponse(state),
      idempotent: true,
    };
  }

  const votesPurchased = Math.max(1, Number(payload.votesPurchased || 0));
  const status: PaymentStatus = payload.status || 'confirmed';
  const createdAt = nowIso();
  const payment: PaymentLedger = {
    paymentId,
    receiptNumber: mkReceipt(),
    eventName: payload.eventName || 'Campus Star 2026',
    votesPurchased,
    votesRemaining: status === 'confirmed' ? votesPurchased : 0,
    amount: Number(payload.amount || 0),
    currency: payload.currency || 'USD',
    paymentMethod: payload.paymentMethod || 'card',
    status,
    createdAt,
    verifiedAt: status === 'confirmed' ? createdAt : undefined,
  };

  state.payments.unshift(payment);

  if (status === 'confirmed') {
    state.paidVotesRemaining += votesPurchased;
    state.totalPaidVotesPurchased += votesPurchased;
  }

  return {
    payment: structuredClone(payment),
    wallet: toWalletResponse(state),
    idempotent: false,
  };
}

export function castVoterVote(
  user: SessionUser,
  payload: {
    categoryId: string;
    categoryName?: string;
    contestantName?: string;
    isPaid: boolean;
    quantity?: number;
  }
) {
  const state = ensureVoterState(user);
  const categoryId = String(payload.categoryId || '').trim();
  if (!categoryId) throw new Error('categoryId is required');

  const quantity = Math.max(1, Number(payload.quantity || 1));

  if (payload.isPaid) {
    if (state.paidVotesRemaining < quantity) {
      throw new Error('Insufficient paid votes');
    }

    let remainingToConsume = quantity;
    let linkedPaymentId: string | undefined;
    let linkedReceiptNumber: string | undefined;

    for (const payment of state.payments) {
      if (payment.status !== 'confirmed' || payment.votesRemaining <= 0) continue;
      const take = Math.min(payment.votesRemaining, remainingToConsume);
      if (take <= 0) continue;
      payment.votesRemaining -= take;
      remainingToConsume -= take;
      if (!linkedPaymentId) {
        linkedPaymentId = payment.paymentId;
        linkedReceiptNumber = payment.receiptNumber;
      }
      if (remainingToConsume <= 0) break;
    }

    state.paidVotesRemaining -= quantity;
    state.totalVotesUsed += quantity;
    const vote: VoteLedger = {
      id: mkId('vote'),
      eventName: 'Campus Star 2026',
      categoryId,
      categoryName: payload.categoryName || 'Paid Vote Category',
      contestantName: payload.contestantName || 'Contestant',
      isPaid: true,
      paidVotes: quantity,
      freeVotes: 0,
      paymentId: linkedPaymentId,
      receiptNumber: linkedReceiptNumber,
      votedAt: nowIso(),
    };
    state.votes.unshift(vote);
    return {
      vote: structuredClone(vote),
      wallet: toWalletResponse(state),
    };
  }

  if (!state.profile.phoneVerified) throw new Error('Phone verification required for free vote');

  const category = state.freeVotes.find((item) => item.categoryId === categoryId);
  if (!category) throw new Error('Unknown category');
  if (category.used) {
    throw new Error('Free vote already used for this category');
  }

  category.used = true;
  state.totalVotesUsed += 1;

  const vote: VoteLedger = {
    id: mkId('vote'),
    eventName: 'Campus Star 2026',
    categoryId: category.categoryId,
    categoryName: payload.categoryName || category.categoryName,
    contestantName: payload.contestantName || 'Contestant',
    isPaid: false,
    paidVotes: 0,
    freeVotes: 1,
    votedAt: nowIso(),
  };
  state.votes.unshift(vote);

  return {
    vote: structuredClone(vote),
    wallet: toWalletResponse(state),
  };
}

export function getVoterPayments(user: SessionUser) {
  const state = ensureVoterState(user);
  return {
    payments: state.payments.map((payment) => ({
      receiptNumber: payment.receiptNumber,
      eventName: payment.eventName,
      voteQuantity: payment.votesPurchased,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt,
      paymentId: payment.paymentId,
      votesRemaining: payment.votesRemaining,
      verifiedAt: payment.verifiedAt,
    })),
  };
}

export function getVoterVotes(user: SessionUser) {
  const state = ensureVoterState(user);
  return {
    votes: state.votes.map((vote) => ({
      eventName: vote.eventName,
      categoryName: vote.categoryName,
      contestant: {
        firstName: vote.contestantName.split(' ')[0] || 'Contestant',
        lastName: vote.contestantName.split(' ').slice(1).join(' ') || 'Voter Choice',
        profileImageUrl: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Vote',
      },
      freeVotes: vote.freeVotes,
      paidVotes: vote.paidVotes,
      totalVotes: vote.freeVotes + vote.paidVotes,
      votedAt: vote.votedAt,
      receiptNumber: vote.receiptNumber,
      paymentId: vote.paymentId,
    })),
  };
}

export function deleteVoterAccount(user: SessionUser) {
  voterStore.delete(user.id);
  return { success: true };
}
