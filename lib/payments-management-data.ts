import { type PaymentData } from '@/components/admin/payments-table';
import { type PaymentStatus, type FraudRisk } from '@/components/admin/payment-status-badge';
import { type PaymentFilterOptions } from '@/components/admin/payment-filters';
import { fetchAdminData } from '@/lib/admin-data-client';

type BackendPaymentRow = {
  id?: string | number;
  payment_id?: string;
  reference?: string;
  event_id?: string | number;
  event_name?: string;
  contestant_name?: string;
  amount?: number;
  currency?: string;
  gateway?: string;
  status?: string;
  fraud_risk?: string;
  ip_address?: string;
  anchored?: boolean;
  created_at?: string;
};

function toStatus(value: unknown): PaymentStatus {
  const raw = String(value || '').toLowerCase();
  if (raw === 'completed' || raw === 'success' || raw === 'paid') return 'COMPLETED';
  if (raw === 'pending' || raw === 'processing') return 'PENDING';
  if (raw === 'failed' || raw === 'error') return 'FAILED';
  if (raw === 'refunded') return 'REFUNDED';
  if (raw === 'flagged' || raw === 'review') return 'FLAGGED';
  return 'PENDING';
}

function toFraudRisk(value: unknown): FraudRisk {
  const raw = String(value || '').toLowerCase();
  if (raw === 'high' || raw === 'critical') return 'High';
  if (raw === 'medium') return 'Medium';
  return 'Low';
}

export async function generateMockPayments(count: number = 386): Promise<PaymentData[]> {
  const query = new URLSearchParams({ page: '1', limit: String(Math.max(1, count)) });
  const response = await fetchAdminData<BackendPaymentRow[]>(
    `/api/admin/system/payments?${query.toString()}`
  );
  const rows = Array.isArray(response.data) ? response.data : [];

  return rows.map((row, index) => ({
    id: String(row.id ?? `pay_${index + 1}`),
    paymentId: String(row.payment_id ?? row.id ?? `#${index + 1}`),
    reference: String(row.reference ?? `PMT${index + 1}`),
    event: String(row.event_name ?? 'Unknown Event'),
    eventId: String(row.event_id ?? ''),
    contestant: String(row.contestant_name ?? 'Unknown Contestant'),
    amount: Number(row.amount ?? 0),
    currency: String(row.currency ?? 'USD'),
    gateway: String(row.gateway ?? 'Unknown'),
    status: toStatus(row.status),
    fraudRisk: toFraudRisk(row.fraud_risk),
    ipAddress: String(row.ip_address ?? '0.0.0.0'),
    anchored: Boolean(row.anchored),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  }));
}

export function filterPayments(
  payments: PaymentData[],
  filters: PaymentFilterOptions
): PaymentData[] {
  return payments.filter((payment) => {
    if (filters.status && payment.status !== filters.status) return false;
    if (filters.event && payment.eventId !== filters.event) return false;
    if (filters.gateway && payment.gateway !== filters.gateway) return false;
    if (filters.fraudRisk && payment.fraudRisk !== filters.fraudRisk) return false;

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (
        !payment.paymentId.toLowerCase().includes(query) &&
        !payment.reference.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    const paymentDate = new Date(payment.createdAt).getTime();
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).getTime();
      if (paymentDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).getTime();
      if (paymentDate > toDate) return false;
    }

    if (filters.minAmount && payment.amount < filters.minAmount) return false;
    if (filters.maxAmount && payment.amount > filters.maxAmount) return false;

    return true;
  });
}

export function sortPayments(
  payments: PaymentData[],
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): PaymentData[] {
  const sorted = [...payments].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortBy) {
      case 'paymentId':
        aVal = a.paymentId;
        bVal = b.paymentId;
        break;
      case 'amount':
        aVal = a.amount;
        bVal = b.amount;
        break;
      case 'status':
        aVal = a.status;
        bVal = b.status;
        break;
      case 'createdAt':
      default:
        aVal = new Date(a.createdAt).getTime();
        bVal = new Date(b.createdAt).getTime();
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

export function paginatePayments(
  payments: PaymentData[],
  page: number,
  pageSize: number
) {
  const total = payments.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = payments.slice(start, end);
  const totalPages = Math.ceil(total / pageSize);

  return { items, total, totalPages, currentPage: page };
}

export function calculatePaymentsSummary(payments: PaymentData[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayPayments = payments.filter((p) => {
    const pDate = new Date(p.createdAt);
    pDate.setHours(0, 0, 0, 0);
    return pDate.getTime() === today.getTime();
  });

  const completed = payments.filter((p) => p.status === 'COMPLETED');
  const pending = payments.filter((p) => p.status === 'PENDING');
  const failed = payments.filter((p) => p.status === 'FAILED');
  const refunded = payments.filter((p) => p.status === 'REFUNDED');

  return {
    totalPaymentsToday: todayPayments.length,
    completedPayments: completed.length,
    pendingPayments: pending.length,
    failedPayments: failed.length,
    refundedAmount: refunded.reduce((sum, p) => sum + p.amount, 0),
    totalRevenue: completed.reduce((sum, p) => sum + p.amount, 0),
  };
}

export function getEventOptions(payments: PaymentData[] = []) {
  const map = new Map<string, string>();
  for (const row of payments) {
    if (row.eventId) map.set(row.eventId, row.event);
  }
  return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
}

export function getGatewayOptions(payments: PaymentData[] = []) {
  const gateways = new Set<string>();
  for (const row of payments) {
    if (row.gateway) gateways.add(row.gateway);
  }
  return Array.from(gateways.values()).sort();
}
