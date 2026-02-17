'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Download, RefreshCw, Settings, AlertTriangle, Shield, Lock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import Link from 'next/link';
import { FraudSummaryCard } from '@/components/admin/fraud-summary-card';
import { FraudFilters, type FraudFilterOptions } from '@/components/admin/fraud-filters';
import { FraudCasesTable, type FraudCase } from '@/components/admin/fraud-cases-table';
import { FraudCaseDetailModal } from '@/components/admin/fraud-case-detail-modal';
import { FraudActionModal } from '@/components/admin/fraud-action-modal';
import {
  generateMockFraudCases,
  calculateFraudSummary,
  filterFraudCases,
  sortFraudCases,
  paginateFraudCases,
  getEventOptions,
} from '@/lib/fraud-monitoring-mock';

type ActionType = 'mark_reviewed' | 'block_ip' | 'block_device' | 'override' | 'escalate';

interface FraudActionState {
  isOpen: boolean;
  action?: ActionType;
  targetId?: string;
  targetName?: string;
}

export default function AdminFraudMonitoringPage() {
  const [allCases, setAllCases] = useState<FraudCase[]>([]);
  const [filteredCases, setFilteredCases] = useState<FraudCase[]>([]);
  const [displayedCases, setDisplayedCases] = useState<FraudCase[]>([]);
  const [summary, setSummary] = useState({
    flaggedTransactions: 0,
    highRiskVotes: 0,
    blockedIPs: 0,
    suspiciousDevices: 0,
    manualOverrides: 0,
    averageFraudScore: 0,
    changes: {
      flaggedTransactions: 0,
      highRiskVotes: 0,
      blockedIPs: 0,
      suspiciousDevices: 0,
    },
  });

  const [filters, setFilters] = useState<FraudFilterOptions>({
    riskLevel: '',
    status: '',
    fraudType: '',
    event: '',
    dateFrom: '',
    dateTo: '',
    ipAddress: '',
    deviceId: '',
    searchQuery: '',
  });

  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedCase, setSelectedCase] = useState<FraudCase | undefined>();
  const [detailModal, setDetailModal] = useState(false);
  const [actionModal, setActionModal] = useState<FraudActionState>({ isOpen: false });

  // Initialize mock data
  useEffect(() => {
    setTimeout(() => {
      const mockCases = generateMockFraudCases(200);
      setAllCases(mockCases);
      setSummary(calculateFraudSummary(mockCases));
      setIsLoading(false);
    }, 800);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = filterFraudCases(allCases, filters);
    result = sortFraudCases(result, sortBy, sortOrder);
    setFilteredCases(result);
    setCurrentPage(1);
  }, [allCases, filters, sortBy, sortOrder]);

  // Apply pagination
  useEffect(() => {
    const paginated = paginateFraudCases(filteredCases, currentPage, pageSize);
    setDisplayedCases(paginated.items);
  }, [filteredCases, currentPage, pageSize]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockCases = generateMockFraudCases(200);
    setAllCases(mockCases);
    setSummary(calculateFraudSummary(mockCases));
    setIsRefreshing(false);
  }, []);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const handleViewDetails = (caseId: string) => {
    const fraudCase = allCases.find((c) => c.id === caseId);
    if (fraudCase) {
      setSelectedCase(fraudCase);
      setDetailModal(true);
    }
  };

  const handleAction = useCallback(
    (action: ActionType, targetId: string, targetName: string) => {
      setActionModal({
        isOpen: true,
        action,
        targetId,
        targetName,
      });
    },
    []
  );

  const handleActionConfirm = async (notes: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(`[Fraud Monitoring] Action: ${actionModal.action}, Target: ${actionModal.targetId}, Notes: ${notes}`);

    // In production, this would update via API
    // For now, just close the modal
    setActionModal({ isOpen: false });
  };

  const handleMarkReviewed = (caseId: string) => {
    const fraudCase = displayedCases.find((c) => c.id === caseId);
    if (fraudCase) {
      handleAction('mark_reviewed', caseId, fraudCase.caseId);
    }
  };

  const handleBlockIP = (ip: string) => {
    handleAction('block_ip', ip, ip);
  };

  const handleBlockDevice = (deviceId: string) => {
    handleAction('block_device', deviceId, deviceId.substring(0, 12) + '...');
  };

  const handleOverride = (caseId: string) => {
    const fraudCase = displayedCases.find((c) => c.id === caseId);
    if (fraudCase) {
      handleAction('override', caseId, fraudCase.caseId);
    }
  };

  const handleEscalate = (caseId: string) => {
    const fraudCase = displayedCases.find((c) => c.id === caseId);
    if (fraudCase) {
      handleAction('escalate', caseId, fraudCase.caseId);
    }
  };

  const totalPages = Math.ceil(filteredCases.length / pageSize);

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
            <div className="flex flex-col gap-4">
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
                    <p className="text-xs sm:text-sm text-muted-foreground">Fraud Control</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                      Fraud Monitoring
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Risk analysis & suspicious activity control
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export Report</span>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Risk Rules</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <FraudSummaryCard
              icon={AlertTriangle}
              title="Flagged Transactions"
              value={summary.flaggedTransactions}
              change={
                summary.changes.flaggedTransactions !== 0
                  ? {
                      value: Math.abs(summary.changes.flaggedTransactions),
                      direction: summary.changes.flaggedTransactions > 0 ? 'up' : 'down',
                    }
                  : undefined
              }
              bgColor="bg-blue-50"
              textColor="text-blue-600"
              isLoading={isLoading}
            />
            <FraudSummaryCard
              icon={AlertTriangle}
              title="High Risk Votes"
              value={summary.highRiskVotes}
              change={
                summary.changes.highRiskVotes !== 0
                  ? {
                      value: Math.abs(summary.changes.highRiskVotes),
                      direction: summary.changes.highRiskVotes > 0 ? 'up' : 'down',
                    }
                  : undefined
              }
              bgColor="bg-red-50"
              textColor="text-red-600"
              isLoading={isLoading}
            />
            <FraudSummaryCard
              icon={Lock}
              title="Blocked IP Addresses"
              value={summary.blockedIPs}
              bgColor="bg-orange-50"
              textColor="text-orange-600"
              isLoading={isLoading}
            />
            <FraudSummaryCard
              icon={Eye}
              title="Suspicious Devices"
              value={summary.suspiciousDevices}
              bgColor="bg-purple-50"
              textColor="text-purple-600"
              isLoading={isLoading}
            />
            <FraudSummaryCard
              icon={Shield}
              title="Manual Overrides"
              value={summary.manualOverrides}
              bgColor="bg-green-50"
              textColor="text-green-600"
              isLoading={isLoading}
            />
            <FraudSummaryCard
              icon={AlertTriangle}
              title="Avg Fraud Score"
              value={`${summary.averageFraudScore}/100`}
              bgColor="bg-yellow-50"
              textColor="text-yellow-600"
              isLoading={isLoading}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <FraudFilters
                onFiltersChange={setFilters}
                eventOptions={getEventOptions()}
                isLoading={isLoading}
              />
            </div>

            {/* Cases Table */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Showing {displayedCases.length} of {filteredCases.length} fraud cases
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <FraudCasesTable
                  cases={displayedCases}
                  isLoading={isLoading}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  onViewDetails={handleViewDetails}
                  onMarkReviewed={handleMarkReviewed}
                  onBlockIP={handleBlockIP}
                  onBlockDevice={handleBlockDevice}
                  onOverride={handleOverride}
                  onEscalate={handleEscalate}
                />
              </div>

              {/* Pagination */}
              {filteredCases.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-xs border border-border rounded px-2 py-1"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={30}>30 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Detail Modal */}
        <FraudCaseDetailModal
          isOpen={detailModal}
          case={selectedCase}
          onClose={() => setDetailModal(false)}
        />

        {/* Action Modal */}
        <FraudActionModal
          isOpen={actionModal.isOpen}
          action={actionModal.action}
          targetId={actionModal.targetId}
          targetName={actionModal.targetName}
          onConfirm={handleActionConfirm}
          onCancel={() => setActionModal({ isOpen: false })}
        />
      </div>
    </ProtectedRouteWrapper>
  );
}
