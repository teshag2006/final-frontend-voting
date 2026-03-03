type MockVoterData = {
  profile: {
    fullName: string;
    email: string;
    phoneNumber: string;
    phoneVerified: boolean;
    googleLinked: boolean;
    createdAt: string;
  };
  payments: {
    payments: Array<{
      receiptNumber: string;
      eventName: string;
      voteQuantity: number;
      amount: number;
      currency: string;
      paymentMethod: string;
      status: string;
      createdAt: string;
    }>;
  };
  votes: {
    votes: Array<{
      eventName: string;
      categoryName: string;
      contestant: {
        firstName: string;
        lastName: string;
        profileImageUrl: string;
      };
      freeVotes: number;
      paidVotes: number;
      totalVotes: number;
      votedAt: string;
      receiptNumber: string;
    }>;
  };
};

export function buildMockVoterData(now = Date.now()): MockVoterData {
  return {
    profile: {
      fullName: 'Amina Okafor',
      email: 'amina@example.com',
      phoneNumber: '+251 914 310 985',
      phoneVerified: true,
      googleLinked: true,
      createdAt: new Date(now - 250 * 24 * 60 * 60 * 1000).toISOString(),
    },
    payments: {
      payments: [
        {
          receiptNumber: 'RCPT-2026-0012',
          eventName: 'Miss Africa 2026',
          voteQuantity: 120,
          amount: 29.99,
          currency: 'USD',
          paymentMethod: 'card',
          status: 'completed',
          createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          receiptNumber: 'RCPT-2026-0009',
          eventName: 'Mr Africa 2026',
          voteQuantity: 50,
          amount: 12.5,
          currency: 'USD',
          paymentMethod: 'paypal',
          status: 'completed',
          createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          receiptNumber: 'RCPT-2026-0006',
          eventName: 'Miss Africa 2026',
          voteQuantity: 20,
          amount: 5,
          currency: 'USD',
          paymentMethod: 'card',
          status: 'pending',
          createdAt: new Date(now - 13 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    votes: {
      votes: [
        {
          eventName: 'Miss Africa 2026',
          categoryName: 'Solo Vocalists',
          contestant: {
            firstName: 'Lydia',
            lastName: 'Mensa',
            profileImageUrl: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Ethiopian%20Portrait',
          },
          freeVotes: 3,
          paidVotes: 15,
          totalVotes: 18,
          votedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
          receiptNumber: 'RCPT-2026-0012',
        },
        {
          eventName: 'Miss Africa 2026',
          categoryName: 'Solo Vocalists',
          contestant: {
            firstName: 'Lydia',
            lastName: 'Mensa',
            profileImageUrl: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Ethiopian%20Portrait',
          },
          freeVotes: 0,
          paidVotes: 10,
          totalVotes: 10,
          votedAt: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
          receiptNumber: 'RCPT-2026-0009',
        },
        {
          eventName: 'Mr Africa 2026',
          categoryName: 'Dance',
          contestant: {
            firstName: 'Kojo',
            lastName: 'Danquah',
            profileImageUrl: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Ethiopian%20Portrait',
          },
          freeVotes: 2,
          paidVotes: 8,
          totalVotes: 10,
          votedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
          receiptNumber: 'RCPT-2026-0010',
        },
      ],
    },
  };
}

export function reseedMockVoterData(now = Date.now()): MockVoterData {
  return buildMockVoterData(now);
}

const seeded = buildMockVoterData();
export const mockVoterProfile = seeded.profile;
export const mockVoterPayments = seeded.payments;
export const mockVoterVotes = seeded.votes;


