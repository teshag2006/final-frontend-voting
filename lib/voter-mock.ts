export const mockVoterProfile = {
  fullName: 'Amina Okafor',
  email: 'amina@example.com',
  phoneNumber: '+1 555 014 9921',
  phoneVerified: true,
  googleLinked: true,
  createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString(),
};

export const mockVoterPayments = {
  payments: [
    {
      receiptNumber: 'RCPT-2026-0012',
      eventName: 'Miss Africa 2026',
      voteQuantity: 120,
      amount: 29.99,
      currency: 'USD',
      paymentMethod: 'card',
      status: 'completed',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      receiptNumber: 'RCPT-2026-0009',
      eventName: 'Mr Africa 2026',
      voteQuantity: 50,
      amount: 12.5,
      currency: 'USD',
      paymentMethod: 'paypal',
      status: 'completed',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      receiptNumber: 'RCPT-2026-0006',
      eventName: 'Miss Africa 2026',
      voteQuantity: 20,
      amount: 5,
      currency: 'USD',
      paymentMethod: 'card',
      status: 'pending',
      createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

export const mockVoterVotes = {
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
      votedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
      votedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
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
      votedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      receiptNumber: 'RCPT-2026-0010',
    },
  ],
};


