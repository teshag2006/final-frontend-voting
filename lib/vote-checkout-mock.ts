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
    providerUrl: "https://stripe.com/payments/checkout",
  },
  {
    id: "mobile_money",
    label: "Mobile Money",
    description: "M-Pesa, Airtel Money, Orange Money",
    enabled: true,
    countries: ["ET", "KE", "UG", "RW", "TZ"],
    providerUrl: "https://www.safaricom.co.ke/main-mpesa/m-pesa-services",
  },
  {
    id: "chapa",
    label: "Chapa",
    description: "Ethiopia's leading payment processor",
    enabled: true,
    countries: ["ET"],
    providerUrl: "https://chapa.co/",
  },
  {
    id: "telebirr",
    label: "Telebirr",
    description: "Ethio Telecom mobile wallet",
    enabled: true,
    countries: ["ET"],
    providerUrl: "https://telebirr.et/",
  },
  {
    id: "digital_wallet",
    label: "PayPal",
    description: "Secure PayPal checkout",
    enabled: true,
    countries: ["ALL"],
    providerUrl: "https://www.paypal.com/checkoutnow",
  },
  {
    id: "crypto",
    label: "Crypto (Bitcoin)",
    description: "Bitcoin or Ethereum",
    enabled: true,
    countries: ["ALL"],
    providerUrl: "https://commerce.coinbase.com/",
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



