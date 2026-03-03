'use client';

import type { WalletResponse } from '@/types/wallet';
import { mockWalletData } from '@/lib/voter-dashboard-mock';

const STORAGE_PREFIX = 'mock_voter_wallet_state:';

interface StoredWalletState {
  isPhoneVerified: boolean;
  phoneNumber: string | null;
  freeVoteUsageByCategory: Record<string, boolean>;
}

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function createDefaultState(): StoredWalletState {
  const usage = Object.fromEntries(
    (mockWalletData.freeVotes || []).map((vote: any) => [String(vote.categoryId), false])
  );

  return {
    isPhoneVerified: false,
    phoneNumber: null,
    freeVoteUsageByCategory: usage,
  };
}

function loadState(userId: string): StoredWalletState {
  if (typeof window === 'undefined') return createDefaultState();

  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as Partial<StoredWalletState>;
    const base = createDefaultState();

    return {
      isPhoneVerified: Boolean(parsed.isPhoneVerified),
      phoneNumber: parsed.phoneNumber || null,
      freeVoteUsageByCategory: {
        ...base.freeVoteUsageByCategory,
        ...(parsed.freeVoteUsageByCategory || {}),
      },
    };
  } catch {
    return createDefaultState();
  }
}

function saveState(userId: string, state: StoredWalletState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
}

function maskPhone(phone: string | null): string {
  if (!phone) return 'Not verified';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return phone;
  return `+${digits.slice(0, 3)} ${digits.slice(3, 4)}XX XXX ${digits.slice(-3)}`;
}

export function getRuntimeWalletForUser(userId: string): {
  walletData: WalletResponse;
  isVerified: boolean;
  maskedPhone: string;
} {
  const state = loadState(userId);
  const freeVotes = (mockWalletData.freeVotes || []).map((vote: any) => {
    const used = Boolean(state.freeVoteUsageByCategory[String(vote.categoryId)]);
    const eligible = state.isPhoneVerified;

    return {
      ...vote,
      isEligible: eligible,
      isUsed: eligible ? used : false,
      isAvailable: eligible ? !used : false,
    };
  });

  return {
    walletData: {
      ...mockWalletData,
      isPhoneVerified: state.isPhoneVerified,
      phoneNumber: state.phoneNumber || '',
      freeVotes,
    },
    isVerified: state.isPhoneVerified,
    maskedPhone: maskPhone(state.phoneNumber),
  };
}

export function markFreeVoteUsed(userId: string, categoryId: string): void {
  const state = loadState(userId);
  if (!state.isPhoneVerified) return;
  state.freeVoteUsageByCategory[String(categoryId)] = true;
  saveState(userId, state);
}

export function setPhoneVerified(userId: string, phoneNumber: string): void {
  const state = loadState(userId);
  state.isPhoneVerified = true;
  state.phoneNumber = phoneNumber;
  saveState(userId, state);
}

export function reseedRuntimeWalletState(userId: string): void {
  saveState(userId, createDefaultState());
}
