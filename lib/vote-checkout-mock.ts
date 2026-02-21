/**
 * Mock data for vote checkout page
 * Replace with real API calls for production
 */

import type {
  VoteCheckoutSession,
  PaymentMethodConfig,
  PricingResponse,
} from "@/types/vote";

export const mockCheckoutSession: VoteCheckoutSession = {
  eventId: "miss-africa-2026",
  contestantId: "abebe-kebede",
  quantity: 10,
  unitPrice: 2.0,
  totalAmount: 20.0,
  paidVotesRemaining: 290,
  dailyVotesRemaining: 40,
  maxPerTransaction: 100,
  transactionToken: "txn_abc123xyz789",
};

export const paymentMethods: PaymentMethodConfig[] = [
  {
    id: "credit_debit_card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, American Express",
    enabled: true,
    countries: ["ALL"],
  },
  {
    id: "mobile_money",
    label: "Mobile Money",
    description: "M-Pesa, Airtel Money, Orange Money",
    enabled: true,
    countries: ["ET", "KE", "UG", "RW", "TZ"],
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    description: "Direct bank account transfer",
    enabled: true,
    countries: ["ET", "ZA", "NG", "GH"],
  },
  {
    id: "chapa",
    label: "Chapa",
    description: "Ethiopia's leading payment processor",
    enabled: true,
    countries: ["ET"],
  },
  {
    id: "telebirr",
    label: "Telebirr",
    description: "Ethio Telecom mobile wallet",
    enabled: true,
    countries: ["ET"],
  },
  {
    id: "cbe_birr",
    label: "CBE-Birr",
    description: "Commercial Bank of Ethiopia",
    enabled: true,
    countries: ["ET"],
  },
  {
    id: "digital_wallet",
    label: "Digital Wallet",
    description: "Google Pay, Apple Pay, Paypal",
    enabled: true,
    countries: ["ALL"],
  },
  {
    id: "crypto",
    label: "Crypto (Bitcoin)",
    description: "Bitcoin or Ethereum",
    enabled: false,
    countries: ["ALL"],
  },
];

export const mockPricingResponse: PricingResponse = {
  pricePerVote: 2.0,
  quantity: 10,
  subtotal: 20.0,
  serviceFee: 1.5,
  tax: 0.5,
  totalAmount: 22.0,
  currency: "USD",
};

// Contestant data displayed on checkout
export const mockCheckoutContestant = {
  id: "abebe-kebede",
  name: "Abebe Kebede",
  category: "Music",
  event: {
    id: "talents-of-tomorrow",
    name: "Talents of Tomorrow",
  },
  image: "https://picsum.photos/seed/contestant-1/1200/800",
  totalVotes: 180456,
  rank: 1,
  pricePerVote: 2.0,
};



