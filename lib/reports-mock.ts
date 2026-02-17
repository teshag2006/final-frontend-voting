export function generateOverviewKPIs() {
  return [
    {
      label: 'Total Votes',
      value: '1,245,880',
      unit: 'votes',
      change: 11.2,
      changeType: 'increase',
    },
    {
      label: 'Gross Revenue',
      value: '$2,847,560',
      unit: 'USD',
      change: 8.4,
      changeType: 'increase',
    },
    {
      label: 'Conversion Rate',
      value: '6.8%',
      unit: 'users to payers',
      change: 1.3,
      changeType: 'decrease',
    },
    {
      label: 'Chargeback Rate',
      value: '0.42%',
      unit: 'payments',
      change: 0.2,
      changeType: 'decrease',
    },
    {
      label: 'Fraud Flags',
      value: '127',
      unit: 'cases',
      change: 4.7,
      changeType: 'increase',
    },
    {
      label: 'Anchored Batches',
      value: '543',
      unit: 'batches',
      change: 6.1,
      changeType: 'increase',
    },
  ];
}

export function generateChartData(days = 30) {
  const out = [];
  const base = Date.now();

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(base - i * 24 * 60 * 60 * 1000);
    const votes = 20000 + Math.floor(Math.random() * 18000);
    const revenue = 45000 + Math.floor(Math.random() * 35000);

    out.push({
      date: date.toISOString().slice(5, 10),
      votes,
      revenue,
      value: Math.floor(votes * (0.45 + Math.random() * 0.35)),
    });
  }

  return out;
}

export function generateVoteAnalytics() {
  const trendData = generateChartData(30).map((d) => ({
    date: d.date,
    votes: d.votes,
  }));

  return {
    totalVotes: trendData.reduce((sum, d) => sum + (d.votes ?? 0), 0),
    uniqueVoters: 189340,
    averageVotesPerUser: 6.58,
    topContestant: {
      name: 'Contestant A',
      votes: 84210,
    },
    topCategory: {
      name: 'Solo Vocalists',
      votes: 220450,
    },
    suspiciousSpikes: 9,
    trendData,
  };
}

export function generatePaymentMetrics() {
  return {
    totalTransactions: 91234,
    successRate: 97.8,
    averageTicketSize: 23.4,
    providers: [
      { name: 'Stripe', amount: 1421780 },
      { name: 'PayPal', amount: 710890 },
      { name: 'Crypto', amount: 568512 },
    ],
  };
}

export function generateFraudMetrics() {
  return {
    totalCases: 127,
    resolvedCases: 96,
    criticalCases: 8,
    votesRemoved: 3421,
  };
}

export function generateSystemLogs() {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `SYS-${i + 1}`,
    level: i % 8 === 0 ? 'ERROR' : i % 3 === 0 ? 'WARN' : 'INFO',
    message: `System log entry ${i + 1}`,
    timestamp: new Date(Date.now() - i * 12 * 60 * 1000).toISOString(),
  }));
}
