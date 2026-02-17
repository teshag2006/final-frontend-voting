/**
 * Mock receipt data for development
 * In production, this will be replaced with real API calls
 */

import { ReceiptData } from '@/types/receipt'

export const mockReceipts: Record<string, ReceiptData> = {
  'RCP-2024-001-5F2X': {
    receiptNumber: 'RCP-2024-001-5F2X',
    paymentStatus: 'completed',
    amount: 40.0,
    currency: 'USD',
    voteQuantity: 50,
    event: {
      name: 'Miss & Mr Africa 2024',
      slug: 'miss-mr-africa-2024',
    },
    category: {
      name: 'Miss Africa',
      slug: 'miss-africa',
    },
    contestant: {
      firstName: 'Sarah',
      lastName: 'Mensah',
      profileImageUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
      verified: true,
    },
    paymentMethod: 'stripe',
    transactionReference: 'ch_1A8OGuIEn852X1a5d8n3Z9Xl',
    votingTimestamp: new Date(Date.now() - 3600000).toISOString(),
    blockchain: {
      isAnchored: true,
      network: 'Ethereum',
      transactionHash:
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      explorerUrl:
        'https://etherscan.io/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    },
    batchNumber: '312',
  },
  'RCP-2024-002-9K3L': {
    receiptNumber: 'RCP-2024-002-9K3L',
    paymentStatus: 'pending',
    amount: 25.0,
    currency: 'USD',
    voteQuantity: 25,
    event: {
      name: 'Campus Star 2024',
      slug: 'campus-star-2024',
    },
    category: {
      name: 'Singing',
      slug: 'singing',
    },
    contestant: {
      firstName: 'Alex',
      lastName: 'Johnson',
      profileImageUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      verified: false,
    },
    paymentMethod: 'paypal',
    transactionReference: 'TXN-20240115-PAYPAL-9K3L',
    votingTimestamp: new Date(Date.now() - 1800000).toISOString(),
    blockchain: {
      isAnchored: false,
    },
    batchNumber: '275',
  },
  'RCP-2024-003-7M2P': {
    receiptNumber: 'RCP-2024-003-7M2P',
    paymentStatus: 'completed',
    amount: 60.0,
    currency: 'ETB',
    voteQuantity: 100,
    event: {
      name: 'Ethiopia Got Talent 2024',
      slug: 'ethiopia-got-talent-2024',
    },
    category: {
      name: 'Dance',
      slug: 'dance',
    },
    contestant: {
      firstName: 'Abeba',
      lastName: 'Getnet',
      profileImageUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
      verified: true,
    },
    paymentMethod: 'chapa',
    transactionReference: 'ch_test_100156987c63fd3a8s3e',
    votingTimestamp: new Date(Date.now() - 7200000).toISOString(),
    blockchain: {
      isAnchored: true,
      network: 'Polygon',
      transactionHash:
        '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      explorerUrl:
        'https://polygonscan.com/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    },
    batchNumber: '401',
  },
}

export async function getMockReceipt(receiptNumber: string): Promise<ReceiptData | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return mockReceipts[receiptNumber] || null
}
