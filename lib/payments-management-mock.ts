import { type PaymentData } from '@/components/admin/payments-table';
import { type PaymentStatus, type FraudRisk } from '@/components/admin/payment-status-badge';
import { type PaymentFilterOptions } from '@/components/admin/payment-filters';

const statuses: PaymentStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'FLAGGED'];
const fraudRisks: FraudRisk[] = ['Low', 'Medium', 'High'];
const gateways = ['Stripe', 'PayPal', 'Google Pay'];
const events = [
  { id: 'evt_1', name: 'Anderson Idol 2024' },
  { id: 'evt_2', name: 'Summer Showdown 2023' },
  { id: 'evt_3', name: 'Winter Finale 2023' },
  { id: 'evt_4', name: 'Spring Classic 2024' },
];

const contestants = [
  'Sophie Turner',
  'Jacob Rodriguez',
  'Emily Chen',
  'Jack Miller',
  'Olivia Parker',
  'David Martinez',
  'Mia Johnson',
  'Ethan Wright',
];

function generatePaymentId(): string {
  return `#${Math.random().toString(16).substring(2, 8).toUpperCase()}`;
}

function generateReference(): string {
  return `PMT${Math.random().toString().substring(2, 9)}`;
}

function generateRandomDate(daysAgo: number = 30): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.random() * daysAgo);
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

function generateRandomIP(): string {
  return Array.from({ length: 4 })
    .map(() => Math.floor(Math.random() * 256))
    .join('.');
}

export function generateMockPayments(count: number = 386): PaymentData[] {
  const payments: PaymentData[] = [];

  for (let i = 0; i < count; i++) {
    const event = events[Math.floor(Math.random() * events.length)];
    const amount = Math.floor(Math.random() * 250) + 25;
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    payments.push({
      id: `pay_${i + 1}`,
      paymentId: generatePaymentId(),
      reference: generateReference(),
      event: event.name,
      eventId: event.id,
      contestant: contestants[Math.floor(Math.random() * contestants.length)],
      amount,
      currency: 'USD',
      gateway: gateways[Math.floor(Math.random() * gateways.length)],
      status,
      fraudRisk: fraudRisks[Math.floor(Math.random() * fraudRisks.length)],
      ipAddress: generateRandomIP(),
      anchored: Math.random() > 0.7,
      createdAt: generateRandomDate(30).toISOString(),
    });
  }

  return payments.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function filterPayments(
  payments: PaymentData[],
  filters: PaymentFilterOptions
): PaymentData[] {
  return payments.filter((payment) => {
    // Status filter
    if (filters.status && payment.status !== filters.status) return false;

    // Event filter
    if (filters.event && payment.eventId !== filters.event) return false;

    // Gateway filter
    if (filters.gateway && payment.gateway !== filters.gateway) return false;

    // Fraud risk filter
    if (filters.fraudRisk && payment.fraudRisk !== filters.fraudRisk) return false;

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (
        !payment.paymentId.toLowerCase().includes(query) &&
        !payment.reference.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Date range filter
    const paymentDate = new Date(payment.createdAt).getTime();
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom).getTime();
      if (paymentDate < fromDate) return false;
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo).getTime();
      if (paymentDate > toDate) return false;
    }

    // Amount range filter
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

export function getEventOptions() {
  return events;
}

export function getGatewayOptions() {
  return gateways;
}
