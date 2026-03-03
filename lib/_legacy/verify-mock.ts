import { VerificationResponse, VerificationError } from '@/types/verification'

// Mock verified receipts
const mockVerifications: Record<string, VerificationResponse> = {
  'VOTE-45BX921ZT8A': {
    receiptNumber: 'VOTE-45BX921ZT8A',
    isValid: true,
    paymentStatus: 'completed',
    voteQuantity: 50,
    event: {
      name: 'Talents of Tomorrow',
    },
    category: {
      name: 'Singing',
    },
    contestant: {
      firstName: 'Sarah',
      lastName: 'M',
    },
    votingTimestamp: '2024-04-24T15:59:00Z',
    blockchain: {
      isAnchored: true,
      network: 'Ethereum',
      transactionHash: '0x5e2cfd4b...9f9d',
    },
  },
  'VOTE-8K2P4L9N3M': {
    receiptNumber: 'VOTE-8K2P4L9N3M',
    isValid: true,
    paymentStatus: 'pending',
    voteQuantity: 25,
    event: {
      name: 'Campus Star 2026',
    },
    category: {
      name: 'Sports',
    },
    contestant: {
      firstName: 'Alex',
      lastName: 'Johnson',
    },
    votingTimestamp: '2024-04-23T10:30:00Z',
    blockchain: {
      isAnchored: false,
      network: undefined,
      transactionHash: undefined,
    },
  },
  'VOTE-7X5R2Q8V1W': {
    receiptNumber: 'VOTE-7X5R2Q8V1W',
    isValid: true,
    paymentStatus: 'completed',
    voteQuantity: 100,
    event: {
      name: 'Miss & Mr Africa',
    },
    category: {
      name: 'Beauty & Charisma',
    },
    contestant: {
      firstName: 'Zainab',
      lastName: 'Hassan',
    },
    votingTimestamp: '2024-04-22T14:15:00Z',
    blockchain: {
      isAnchored: true,
      network: 'Polygon',
      transactionHash: '0xa1b2c3d4...e5f6',
    },
  },
}

export async function getVerificationData(
  receiptNumber: string
): Promise<VerificationResponse | VerificationError> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const normalized = receiptNumber.toUpperCase().trim()

  if (!normalized || normalized.length < 5) {
    return {
      error: true,
      message: 'Invalid receipt number format',
      status: 400,
    } as VerificationError
  }

  const data = mockVerifications[normalized]

  if (!data) {
    return {
      error: true,
      message: 'Receipt not found',
      status: 404,
    } as VerificationError
  }

  return data
}

export function getExplorerUrl(
  transactionHash: string,
  network: string = 'Ethereum'
): string {
  const baseUrls: Record<string, string> = {
    Ethereum: 'https://etherscan.io/tx/',
    Polygon: 'https://polygonscan.com/tx/',
    Bitcoin: 'https://blockchair.com/bitcoin/transaction/',
  }

  return `${baseUrls[network] || baseUrls['Ethereum']}${transactionHash}`
}

export function shortenHash(hash: string): string {
  if (!hash || hash.length < 10) return hash
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}
