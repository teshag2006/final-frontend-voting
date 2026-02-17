'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, CheckCircle, Clock, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import Link from 'next/link';
import { PaymentSummaryCard } from '@/components/admin/payment-summary-card';
import { PaymentFilters, type PaymentFilterOptions } from '@/components/admin/payment-filters';
import { PaymentsTable, type PaymentData } from '@/components/admin/payments-table';
import { ExportPaymentsButton } from '@/components/admin/export-payments-button';
import { RefundConfirmationModal } from '@/components/admin/refund-confirmation-modal';
import {
  generateMockPayments,
  filterPayments,
  sortPayments,
  paginatePayments,
  calculatePaymentsSummary,
  getEventOptions,
  getGatewayOptions,
} from '@/lib/payments-management-mock';

export default function AdminPaymentsPage() {
  const [allPayments, setAllPayments] = useState<PaymentData[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentData[]>([]);
  const [displayedPayments, setDisplayedPayments] = useState<PaymentData[]>([]);
  const [summary, setSummary] = useState({
    totalPaymentsToday: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    refundedAmount: 0,
    totalRevenue: 0,
  });

  const [filters, setFilters] = useState<PaymentFilterOptions>({
    status: '',
    event: '',
    gateway: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    fraudRisk: '',
    searchQuery: '',
  });

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundModal, setRefundModal] = useState<{
    isOpen: boolean;
    payment?: PaymentData;
  }>({ isOpen: false });

  // Initialize mock data
  useEffect(() => {
    setTimeout(() => {
      const mockPayments = generateMockPayments(386);
      setAllPayments(mockPayments);
      setSummary(calculatePaymentsSummary(mockPayments));
      setIsLoading(false);
    }, 800);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = filterPayments(allPayments, filters);
    result = sortPayments(result, sortBy, sortOrder);
    setFilteredPayments(result);
    setCurrentPage(1);
  }, [allPayments, filters, sortBy, sortOrder]);

  // Apply pagination
  useEffect(() => {
    const paginated = paginatePayments(filteredPayments, currentPage, pageSize);
    setDisplayedPayments(paginated.items);
  }, [filteredPayments, currentPage, pageSize]);

  const handleSortChange = (column: string, order: string) => {
    setSortBy(column);
    setSortOrder(order as 'asc' | 'desc');
  };

  const handleViewDetails = (payment: PaymentData) => {
    console.log('View details for payment:', payment);
    // In real app, navigate to detail page or open modal
  };

  const handleVerify = (payment: PaymentData) => {
    if (confirm(`Verify payment ${payment.paymentId}?`)) {
      setAllPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id ? { ...p, status: 'COMPLETED' as const } : p
        )
      );
    }
  };

  const handleRefund = (payment: PaymentData) => {
    setRefundModal({ isOpen: true, payment });
  };

  const handleConfirmRefund = async () => {
    if (!refundModal.payment) return;

    setIsRefunding(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      setAllPayments((prev) =>
        prev.map((p) =>
          p.id === refundModal.payment!.id
            ? { ...p, status: 'REFUNDED' as const }
            : p
        )
      );

      setSummary(calculatePaymentsSummary(filteredPayments));
    } catch (error) {
      console.error('Refund failed:', error);
    } finally {
      setIsRefunding(false);
      setRefundModal({ isOpen: false });
    }
  };

  const handleFlagSuspicious = (payment: PaymentData) => {
    if (confirm(`Flag payment ${payment.paymentId} as suspicious?`)) {
      setAllPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id ? { ...p, status: 'FLAGGED' as const } : p
        )
      );
    }
  };

  const handleViewLog = (payment: PaymentData) => {
    console.log('View gateway log for payment:', payment);
    // In real app, open gateway logs modal
  };

  return (
    <ProtectedRouteWrapper
      requiredRole="admin"
      autoSignInWith="admin"
      fallbackUrl="/events"
    >
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/dashboard"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted transition-colors"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Payment Management</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Payment Management
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Transaction tracking and financial reconciliation
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <ExportPaymentsButton payments={displayedPayments} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <PaymentSummaryCard
              icon={DollarSign}
              title="Total Payments Today"
              value={summary.totalPaymentsToday}
              bgColor="bg-blue-500"
              isLoading={isLoading}
            />
            <PaymentSummaryCard
              icon={CheckCircle}
              title="Completed Payments"
              value={summary.completedPayments}
              bgColor="bg-green-500"
              isLoading={isLoading}
            />
            <PaymentSummaryCard
              icon={Clock}
              title="Pending Payments"
              value={summary.pendingPayments}
              bgColor="bg-yellow-500"
              isLoading={isLoading}
            />
            <PaymentSummaryCard
              icon={AlertCircle}
              title="Failed Payments"
              value={summary.failedPayments}
              bgColor="bg-red-500"
              isLoading={isLoading}
            />
            <PaymentSummaryCard
              icon={Info}
              title="Total Revenue"
              value={summary.totalRevenue}
              bgColor="bg-indigo-500"
              isLoading={isLoading}
              isAmount
            />
          </div>

          {/* Filters Section */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <PaymentFilters
              filters={filters}
              onFiltersChange={setFilters}
              events={getEventOptions()}
              gateways={getGatewayOptions()}
              isLoading={isLoading}
            />
          </div>

          {/* Payments Summary and Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Payments Table</h2>
              <p className="text-sm text-muted-foreground">
                Showing {displayedPayments.length} of {filteredPayments.length} payments
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              <span>{Math.ceil(filteredPayments.length / pageSize)} pages</span>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
            <PaymentsTable
              payments={displayedPayments}
              isLoading={isLoading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
              onViewDetails={handleViewDetails}
              onVerify={handleVerify}
              onRefund={handleRefund}
              onFlagSuspicious={handleFlagSuspicious}
              onViewLog={handleViewLog}
            />
          </div>

          {/* Pagination */}
          {filteredPayments.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredPayments.length)} of{' '}
                {filteredPayments.length} payments
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({
                    length: Math.min(
                      5,
                      Math.ceil(filteredPayments.length / pageSize)
                    ),
                  }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-10"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        Math.ceil(filteredPayments.length / pageSize),
                        currentPage + 1
                      )
                    )
                  }
                  disabled={currentPage === Math.ceil(filteredPayments.length / pageSize)}
                >
                  Next
                </Button>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-border rounded text-sm"
                  aria-label="Items per page"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          )}
        </main>

        {/* Refund Confirmation Modal */}
        {refundModal.payment && (
          <RefundConfirmationModal
            isOpen={refundModal.isOpen}
            onClose={() => setRefundModal({ isOpen: false })}
            onConfirm={handleConfirmRefund}
            paymentId={refundModal.payment.paymentId}
            amount={refundModal.payment.amount}
            contestant={refundModal.payment.contestant}
            isLoading={isRefunding}
          />
        )}
      </div>
    </ProtectedRouteWrapper>
  );
}
