'use client';

import { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import type {
  ContestantChangeRequest,
  ContestantPublishingState,
} from '@/lib/contestant-runtime-store';

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

  const [sortBy, setSortBy] = useState<'name' | 'category' | 'status' | 'created' | 'votes' | 'revenue'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState<ContestantData | undefined>();
  const [viewContestant, setViewContestant] = useState<ContestantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishingState, setPublishingState] = useState<ContestantPublishingState | null>(null);
  const [changeRequests, setChangeRequests] = useState<ContestantChangeRequest[]>([]);

  const loadContestantsFromApi = async (): Promise<ContestantData[] | null> => {
    try {
      const response = await fetch('/api/admin/contestants');
      if (!response.ok) {
        return null;
      }
      const payload = (await response.json()) as ContestantData[];
      return Array.isArray(payload) ? payload : [];
    } catch {
      return null;
    }
  };

  const syncContestantCreate = async (contestant: ContestantData): Promise<ContestantData | null> => {
    try {
      const response = await fetch('/api/admin/contestants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contestant),
      });
      if (!response.ok) return null;
      return (await response.json()) as ContestantData;
    } catch {
      return null;
    }
  };

  const syncContestantPatch = async (
    id: string,
    patch: Partial<ContestantData>
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/contestants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, patch }),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const syncContestantDelete = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/contestants?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const loadModeration = async () => {
    const [publishingRes, requestsRes] = await Promise.all([
      fetch('/api/admin/contestant/publishing'),
      fetch('/api/admin/contestant/change-requests'),
    ]);
    if (publishingRes.ok) {
      setPublishingState((await publishingRes.json()) as ContestantPublishingState);
    }
    if (requestsRes.ok) {
      setChangeRequests((await requestsRes.json()) as ContestantChangeRequest[]);
    }
  };

  // Initialize contestants data with backend-first + mock fallback
  useEffect(() => {
    const loadContestantsData = async () => {
      const mockCategories = getCategories();
      setCategories(mockCategories);
      const data = await loadContestantsFromApi();
      if (data === null) {
        const mockContestants = generateMockContestants(120);
        setAllContestants(mockContestants);
      } else {
        setAllContestants(data);
      }
      setIsLoading(false);
    };
    void loadContestantsData();
    void loadModeration();
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
    setViewContestant(contestant);
  };

  const handleApproveContestant = async (contestant: ContestantData) => {
    if (confirm(`Approve contestant "${contestant.name}"?`)) {
      setAllContestants((prev) =>
        prev.map((c) => (c.id === contestant.id ? { ...c, status: 'APPROVED' as const } : c))
      );
      const ok = await syncContestantPatch(contestant.id, { status: 'APPROVED' });
      if (!ok) {
        setAllContestants((prev) =>
          prev.map((c) => (c.id === contestant.id ? { ...c, status: contestant.status } : c))
        );
      }
    }
  };

  const handleRejectContestant = async (contestant: ContestantData) => {
    if (confirm(`Reject contestant "${contestant.name}"?`)) {
      setAllContestants((prev) =>
        prev.map((c) => (c.id === contestant.id ? { ...c, status: 'REJECTED' as const } : c))
      );
      const ok = await syncContestantPatch(contestant.id, { status: 'REJECTED' });
      if (!ok) {
        setAllContestants((prev) =>
          prev.map((c) => (c.id === contestant.id ? { ...c, status: contestant.status } : c))
        );
      }
    }
  };

  const handleDisableContestant = async (contestant: ContestantData) => {
    if (confirm(`Disable contestant "${contestant.name}"? They will not appear in voting.`)) {
      setAllContestants((prev) =>
        prev.map((c) => (c.id === contestant.id ? { ...c, status: 'DISABLED' as const } : c))
      );
      const ok = await syncContestantPatch(contestant.id, { status: 'DISABLED' });
      if (!ok) {
        setAllContestants((prev) =>
          prev.map((c) => (c.id === contestant.id ? { ...c, status: contestant.status } : c))
        );
      }
    }
  };

  const handleDeleteContestant = async (contestant: ContestantData) => {
    if (
      confirm(
        `Delete contestant "${contestant.name}"? This action cannot be undone and will remove all associated votes.`
      )
    ) {
      setAllContestants((prev) => prev.filter((c) => c.id !== contestant.id));
      const ok = await syncContestantDelete(contestant.id);
      if (!ok) {
        setAllContestants((prev) => [contestant, ...prev]);
      }
    }
  };

  const handlePublishingDecision = async (action: 'approve' | 'reject' | 'reopen') => {
    const reason =
      action === 'reject'
        ? window.prompt('Enter rejection reason for contestant profile:') || undefined
        : undefined;
    await fetch('/api/admin/contestant/publishing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    await loadModeration();
  };

  const handleChangeRequestDecision = async (
    requestId: string,
    action: 'approve' | 'reject'
  ) => {
    const note = window.prompt(`Optional note for ${action}:`) || undefined;
    await fetch(`/api/admin/contestant/change-requests/${requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, note }),
    });
    await loadModeration();
  };

  const handleModalSubmit = async (data: ContestantFormData) => {
    setIsSubmitting(true);

    try {
      if (selectedContestant) {
        // Edit existing contestant
        const patch: Partial<ContestantData> = {
          name: data.name,
          bio: data.bio,
          category: categories.find((cat) => cat.id === data.category)?.name || selectedContestant.category,
          categoryId: data.category,
          status: data.status || selectedContestant.status,
          avatar: data.avatar || selectedContestant.avatar,
          galleryImages: data.galleryImages || selectedContestant.galleryImages,
        };
        setAllContestants((prev) =>
          prev.map((c) =>
            c.id === selectedContestant.id
              ? {
                  ...c,
                  ...patch,
                }
              : c
          )
        );
        const ok = await syncContestantPatch(selectedContestant.id, patch);
        if (!ok) {
          setAllContestants((prev) =>
            prev.map((c) => (c.id === selectedContestant.id ? selectedContestant : c))
          );
        }
      } else {
        // Create new contestant
        const fallbackContestant: ContestantData = {
          id: `#${Date.now()}`,
          ...data,
          category: categories.find((cat) => cat.id === data.category)?.name || '',
          categoryId: data.category,
          status: data.status || 'PENDING',
          totalVotes: 0,
          revenue: 0,
          createdAt: new Date().toISOString(),
        };
        const created = await syncContestantCreate(fallbackContestant);
        setAllContestants((prev) => [created ?? fallbackContestant, ...prev]);
      }
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  const handleSortChange = (by: string, order: string) => {
    setSortBy(by as 'name' | 'category' | 'status' | 'created' | 'votes' | 'revenue');
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

          <section className="mb-6 rounded-lg border border-border bg-card p-4">
            <h2 className="text-lg font-semibold text-foreground">Contestant Publishing Moderation</h2>
            {publishingState ? (
              <div className="mt-2 text-sm text-muted-foreground">
                <p>
                  Submission: <strong>{publishingState.submissionStatus}</strong> | Admin review:{' '}
                  <strong>{publishingState.adminReviewStatus}</strong> | Public:{' '}
                  <strong>{publishingState.published ? 'Published' : 'Hidden'}</strong> | Locked:{' '}
                  <strong>{publishingState.profileLocked ? 'Yes' : 'No'}</strong>
                </p>
                {publishingState.rejectionReason ? (
                  <p className="mt-1 text-red-600">Rejection reason: {publishingState.rejectionReason}</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Loading moderation state...</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => void handlePublishingDecision('approve')}>
                Approve & Publish
              </Button>
              <Button size="sm" variant="outline" onClick={() => void handlePublishingDecision('reject')}>
                Reject
              </Button>
              <Button size="sm" variant="outline" onClick={() => void handlePublishingDecision('reopen')}>
                Reopen Review
              </Button>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-foreground">Pending Change Requests</h3>
              <div className="mt-2 space-y-2">
                {changeRequests.filter((item) => item.status === 'pending').slice(0, 8).map((item) => (
                  <div key={item.id} className="rounded-md border border-border bg-muted/30 p-3 text-sm">
                    <p className="font-medium text-foreground">
                      {item.type} request - {new Date(item.requestedAt).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">{item.reason}</p>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => void handleChangeRequestDecision(item.id, 'approve')}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void handleChangeRequestDecision(item.id, 'reject')}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
                {changeRequests.filter((item) => item.status === 'pending').length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending change requests.</p>
                ) : null}
              </div>
            </div>
          </section>

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

        <Dialog open={Boolean(viewContestant)} onOpenChange={(open) => !open && setViewContestant(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contestant Details</DialogTitle>
            </DialogHeader>
            {viewContestant ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {viewContestant.avatar ? (
                    <img
                      src={viewContestant.avatar}
                      alt={viewContestant.name}
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
                      No photo
                    </div>
                  )}
                  <div className="space-y-1 text-sm">
                    <p className="text-xl font-semibold text-slate-900">{viewContestant.name}</p>
                    <p className="text-slate-600">ID: {viewContestant.id}</p>
                    <p className="text-slate-600">Category: {viewContestant.category}</p>
                    <p className="text-slate-600">Status: {viewContestant.status}</p>
                    <p className="text-slate-600">Votes: {viewContestant.totalVotes.toLocaleString()}</p>
                    <p className="text-slate-600">
                      Revenue: $
                      {viewContestant.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-sm font-medium text-slate-900">Bio</p>
                  <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    {viewContestant.bio || 'No bio provided.'}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-900">Uploaded Photos</p>
                  {viewContestant.galleryImages && viewContestant.galleryImages.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {viewContestant.galleryImages.map((src, index) => (
                        <img
                          key={`${src}-${index}`}
                          src={src}
                          alt={`${viewContestant.name} photo ${index + 1}`}
                          className="h-16 w-full rounded-md object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No additional photos uploaded.</p>
                  )}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRouteWrapper>
  );
}

