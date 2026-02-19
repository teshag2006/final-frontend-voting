'use client';

import { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import Link from 'next/link';
import { ContestantsTable, type ContestantData } from '@/components/admin/contestants-table';
import { ContestantFilters, type FilterOptions } from '@/components/admin/contestant-filters';
import {
  CreateEditContestantModal,
  type ContestantFormData,
} from '@/components/admin/create-edit-contestant-modal';
import { ExportContestantsButton } from '@/components/admin/export-contestants-button';
import {
  generateMockContestants,
  filterContestants,
  sortContestants,
  paginateContestants,
  getCategories,
  type CategoryOption,
} from '@/lib/contestants-management-mock';

export default function AdminContestantsPage() {
  const [allContestants, setAllContestants] = useState<ContestantData[]>([]);
  const [filteredContestants, setFilteredContestants] = useState<ContestantData[]>([]);
  const [displayedContestants, setDisplayedContestants] = useState<ContestantData[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    status: '',
  });

  const [sortBy, setSortBy] = useState<'name' | 'created' | 'votes' | 'revenue'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState<ContestantData | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize mock data
  useEffect(() => {
    setTimeout(() => {
      const mockContestants = generateMockContestants(120);
      setAllContestants(mockContestants);
      const mockCategories = getCategories();
      setCategories(mockCategories);
      setIsLoading(false);
    }, 600);
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let result = filterContestants(allContestants, filters);
    result = sortContestants(result, sortBy, sortOrder);
    setFilteredContestants(result);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [allContestants, filters, sortBy, sortOrder]);

  // Apply pagination
  useEffect(() => {
    const paginated = paginateContestants(filteredContestants, currentPage, pageSize);
    setDisplayedContestants(paginated.items);
  }, [filteredContestants, currentPage, pageSize]);

  const handleCreateContestant = () => {
    setSelectedContestant(undefined);
    setIsModalOpen(true);
  };

  const handleEditContestant = (contestant: ContestantData) => {
    setSelectedContestant(contestant);
    setIsModalOpen(true);
  };

  const handleViewContestant = (contestant: ContestantData) => {
    // In real app, navigate to detail page
    console.log('View contestant:', contestant);
  };

  const handleApproveContestant = (contestant: ContestantData) => {
    if (confirm(`Approve contestant "${contestant.name}"?`)) {
      setAllContestants((prev) =>
        prev.map((c) => (c.id === contestant.id ? { ...c, status: 'APPROVED' as const } : c))
      );
    }
  };

  const handleRejectContestant = (contestant: ContestantData) => {
    if (confirm(`Reject contestant "${contestant.name}"?`)) {
      setAllContestants((prev) =>
        prev.map((c) => (c.id === contestant.id ? { ...c, status: 'REJECTED' as const } : c))
      );
    }
  };

  const handleDisableContestant = (contestant: ContestantData) => {
    if (confirm(`Disable contestant "${contestant.name}"? They will not appear in voting.`)) {
      setAllContestants((prev) =>
        prev.map((c) => (c.id === contestant.id ? { ...c, status: 'DISABLED' as const } : c))
      );
    }
  };

  const handleDeleteContestant = (contestant: ContestantData) => {
    if (
      confirm(
        `Delete contestant "${contestant.name}"? This action cannot be undone and will remove all associated votes.`
      )
    ) {
      setAllContestants((prev) => prev.filter((c) => c.id !== contestant.id));
    }
  };

  const handleModalSubmit = async (data: ContestantFormData) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      if (selectedContestant) {
        // Edit existing contestant
        setAllContestants((prev) =>
          prev.map((c) =>
            c.id === selectedContestant.id
              ? {
                  ...c,
                  name: data.name,
                  bio: data.bio,
                  category: categories.find((cat) => cat.id === data.category)?.name || c.category,
                  categoryId: data.category,
                  status: data.status || c.status,
                  avatar: data.avatar || c.avatar,
                }
              : c
          )
        );
      } else {
        // Create new contestant
        const newContestant: ContestantData = {
          id: `#${String(5000 + allContestants.length).padStart(4, '0')}`,
          ...data,
          category: categories.find((cat) => cat.id === data.category)?.name || '',
          categoryId: data.category,
          status: data.status || 'PENDING',
          totalVotes: 0,
          revenue: 0,
          createdAt: new Date().toISOString(),
        };
        setAllContestants((prev) => [newContestant, ...prev]);
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  const handleSortChange = (by: string, order: string) => {
    setSortBy(by as 'name' | 'created' | 'votes' | 'revenue');
    setSortOrder(order as 'asc' | 'desc');
  };

  const totalContestants = filteredContestants.length;
  const totalPages = Math.ceil(totalContestants / pageSize);

  return (
    <ProtectedRouteWrapper
      requiredRole="admin"
      fallbackUrl="/events"
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
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
                  <p className="text-xs sm:text-sm text-muted-foreground">Contestant Management</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Contestant Management
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage all contestants across categories
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild variant="outline" size="lg">
                  <Link href="/admin/sponsors">Sponsor Assignments</Link>
                </Button>
                <ExportContestantsButton
                  contestants={filteredContestants}
                  fileName={`contestants-${new Date().toISOString().split('T')[0]}.csv`}
                  isLoading={isSubmitting}
                />
                <Button
                  onClick={handleCreateContestant}
                  className="gap-2 w-full sm:w-auto"
                  size="lg"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Contestant</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters Section */}
          <div className="mb-6 bg-card border border-border rounded-lg p-4">
            <ContestantFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              isLoading={isSubmitting}
            />
          </div>

          {/* Contestants Summary */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing {filteredContestants.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredContestants.length)} of{' '}
                {filteredContestants.length} contestants
              </p>
            </div>
          </div>

          {/* Contestants Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading contestants...</p>
              </div>
            ) : (
              <ContestantsTable
                contestants={displayedContestants}
                isLoading={isSubmitting}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                onView={handleViewContestant}
                onEdit={handleEditContestant}
                onApprove={handleApproveContestant}
                onReject={handleRejectContestant}
                onDisable={handleDisableContestant}
                onDelete={handleDeleteContestant}
                pageInfo={{
                  current: currentPage,
                  total: filteredContestants.length,
                  perPage: pageSize,
                }}
              />
            )}
          </div>

          {/* Pagination Controls */}
          {totalContestants > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({totalContestants} total)
              </div>

              <div className="flex items-center gap-2">
                {/* Page size selector */}
                <label htmlFor="page-size" className="text-sm text-muted-foreground">
                  Show:
                </label>
                <select
                  id="page-size"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  disabled={isSubmitting}
                  className="h-9 px-3 rounded-md border border-border bg-background text-sm"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>

              {/* Page number buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1 || isSubmitting}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isSubmitting}
                >
                  Prev
                </Button>

                {/* Page numbers - show up to 5 pages */}
                {Array.from({ length: Math.min(5, totalPages) })
                  .map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        disabled={isSubmitting}
                      >
                        {page}
                      </Button>
                    );
                  })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isSubmitting}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || isSubmitting}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Create/Edit Contestant Modal */}
        <CreateEditContestantModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedContestant(undefined);
          }}
          onSubmit={handleModalSubmit}
          initialData={selectedContestant}
          categories={categories}
          isLoading={isSubmitting}
        />
      </div>
    </ProtectedRouteWrapper>
  );
}

