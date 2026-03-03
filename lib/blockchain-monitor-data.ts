import { fetchAdminData } from '@/lib/admin-data-client';

function toAnchorStatus(value: unknown): 'PENDING' | 'CONFIRMED' | 'FAILED' {
  const raw = String(value || '').toLowerCase();
  if (raw.includes('fail')) return 'FAILED';
  if (raw.includes('confirm')) return 'CONFIRMED';
  return 'PENDING';
}

export async function generateMockAnchorRecords(count = 50) {
  const query = new URLSearchParams({ page: '1', limit: String(count) });
  const response = await fetchAdminData<any[]>(
    `/api/admin/blockchain/batches?${query.toString()}`
  );
  const rows = Array.isArray(response.data) ? response.data : [];

  return rows.map((row, index) => ({
    anchorId: String(row.id ?? row.batch_id ?? `ANCH-${index + 1}`),
    anchorType: String(row.anchor_type ?? row.type ?? 'VOTES').toUpperCase(),
    referenceId: String(row.reference_id ?? row.vote_batch_id ?? row.event_id ?? ''),
    snapshotHash: String(row.merkle_root ?? row.snapshot_hash ?? ''),
    blockchainNetwork: String(row.network ?? row.blockchain_network ?? 'ETHEREUM').toUpperCase(),
    status: toAnchorStatus(row.status ?? row.confirmed),
    anchoredAt: String(row.anchored_at ?? row.created_at ?? new Date().toISOString()),
    transactionHash: String(row.tx_hash ?? row.transaction_hash ?? ''),
  }));
}

export async function getBlockchainSummary() {
  const [statsRes, batches] = await Promise.all([
    fetchAdminData<any>('/api/admin/blockchain/stats'),
    generateMockAnchorRecords(100),
  ]);

  const stats = statsRes.data ?? {};
  const confirmedAnchors = Number(
    stats.confirmed_batches ?? batches.filter((row) => row.status === 'CONFIRMED').length
  );
  const pendingAnchors = Number(
    stats.pending_batches ?? batches.filter((row) => row.status === 'PENDING').length
  );
  const failedAnchors = Number(
    stats.failed_batches ?? batches.filter((row) => row.status === 'FAILED').length
  );

  return {
    totalAnchors: Number(stats.total_batches ?? batches.length),
    confirmedAnchors,
    pendingAnchors,
    failedAnchors,
    avgConfirmationTime: Number(stats.avg_confirmation_seconds ?? 0),
    lastAnchoredAt: new Date(
      String(stats.last_anchor_at ?? batches[0]?.anchoredAt ?? new Date().toISOString())
    ),
    integrityAlerts: failedAnchors,
  };
}

export async function generateMockSnapshotDetail() {
  const records = await generateMockAnchorRecords(1);
  const row = records[0];
  return {
    generatedHash: row?.snapshotHash || '',
    blockchainTransactionHash: row?.transactionHash || '',
    blockNumber: 0,
    network: row?.blockchainNetwork || 'ETHEREUM',
  };
}
