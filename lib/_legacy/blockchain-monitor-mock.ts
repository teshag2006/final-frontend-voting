const NETWORKS = ['ETHEREUM', 'POLYGON', 'ARBITRUM', 'OPTIMISM'] as const;
const TYPES = ['VOTES', 'PAYMENTS', 'EVENT_FINAL', 'FRAUD', 'REPORT'] as const;
const STATUSES = ['PENDING', 'CONFIRMED', 'FAILED'] as const;

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomHash(prefix = '0x', length = 64): string {
  const chars = 'abcdef0123456789';
  let out = prefix;
  for (let i = 0; i < length; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function generateMockAnchorRecords(count = 50) {
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const status =
      i % 10 === 0 ? 'FAILED' : i % 4 === 0 ? 'PENDING' : 'CONFIRMED';

    return {
      anchorId: `ANCH-${String(100000 + i)}`,
      anchorType: randomItem(TYPES),
      referenceId: `REF-${String(9000 + i)}`,
      snapshotHash: randomHash(),
      blockchainNetwork: randomItem(NETWORKS),
      status,
      anchoredAt: new Date(now - i * 35 * 60 * 1000).toISOString(),
      transactionHash: randomHash(),
    };
  });
}

export function getBlockchainSummary() {
  const records = generateMockAnchorRecords(80);
  const confirmedAnchors = records.filter((r) => r.status === 'CONFIRMED').length;
  const pendingAnchors = records.filter((r) => r.status === 'PENDING').length;
  const failedAnchors = records.filter((r) => r.status === 'FAILED').length;

  return {
    totalAnchors: records.length,
    confirmedAnchors,
    pendingAnchors,
    failedAnchors,
    avgConfirmationTime: 43,
    lastAnchoredAt: new Date(records[0]?.anchoredAt ?? Date.now()),
    integrityAlerts: failedAnchors,
  };
}

export function generateMockSnapshotDetail() {
  return {
    generatedHash: randomHash(),
    blockchainTransactionHash: randomHash(),
    blockNumber: 54982391,
    network: randomItem(NETWORKS),
  };
}
