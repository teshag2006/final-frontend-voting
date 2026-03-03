export type PaymentMethod =
  | 'credit_debit_card'
  | 'mobile_money'
  | 'chapa'
  | 'telebirr'
  | 'digital_wallet'
  | 'crypto'
  | 'cbe_birr'
  | 'bank_transfer';

export interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  description: string;
  enabled: boolean;
  countries: string[];
  providerUrl?: string;
}

export interface PricingResponse {
  pricePerVote: number;
  quantity: number;
  subtotal: number;
  serviceFee: number;
  tax: number;
  totalAmount: number;
  currency: string;
}

export interface VoteCheckoutSession {
  eventId?: string;
  contestantId?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paidVotesRemaining?: number;
  dailyVotesRemaining?: number;
  maxPerTransaction?: number;
  transactionToken?: string;
}

export interface VoteEligibility {
  country?: string;
  freeEligible: boolean;
  freeUsed: boolean;
  paidVotesUsed?: number;
  paidVotesRemaining: number;
  maxPerTransaction: number;
  dailyVotesRemaining: number;
  totalVotesRemaining?: number;
  requiresPayment?: boolean;
}

export interface VoteLimits {
  maxPerTransaction: number;
  maxPerEvent?: number;
  maxPerDay?: number;
  dailyVotesRemaining: number;
}
