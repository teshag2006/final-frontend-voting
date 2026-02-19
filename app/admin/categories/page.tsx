'use client';

import { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import Link from 'next/link';
import { CategoriesTable, CategoryData } from '@/components/admin/categories-table';
import { CreateEditCategoryModal, CategoryFormData } from '@/components/admin/create-edit-category-modal';
import { EventSelector, EventOption } from '@/components/admin/event-selector';
import {
  generateMockCategories,
  filterCategoriesByEvent,
  sortCategories,
  generateMockEvents,
} from '@/lib/categories-management-mock';

export default function AdminCategoriesPage() {
  const [allCategories, setAllCategories] = useState<CategoryData[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryData[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [events, setEvents] = useState<EventOption[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'status'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize mock data
  useEffect(() => {
    setTimeout(() => {
      const mockEvents = generateMockEvents();
      setEvents(mockEvents);
      const mockCategories = generateMockCategories();
      setAllCategories(mockCategories);
      // Pre-select first active event
      const firstEvent = mockEvents.find((e) => e.status === 'ACTIVE');
      if (firstEvent) {
        setSelectedEventId(firstEvent.id);
      }
      setIsLoading(false);
    }, 500);
  }, []);

  // Apply filters and sorting when event selection or data changes
  useEffect(() => {
    if (!selectedEventId) {
      setFilteredCategories([]);
      return;
    }

    let result = filterCategoriesByEvent(allCategories, selectedEventId);
    result = sortCategories(result, sortBy, sortOrder);
    setFilteredCategories(result);
  }, [allCategories, selectedEventId, sortBy, sortOrder]);

  const handleCreateCategory = () => {
    setSelectedCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: CategoryData) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (category: CategoryData) => {
    if (category.totalContestants > 0) {
      alert('Cannot delete category with existing contestants. Remove or transfer contestants first.');
      return;
    }

    if (confirm(`Delete category "${category.name}"? This action cannot be undone.`)) {
      setAllCategories((prev) => prev.filter((c) => c.id !== category.id));
    }
  };

  const handleDeactivateCategory = (category: CategoryData) => {
    if (confirm(`Deactivate "${category.name}"? Voting will be disabled for this category.`)) {
      setAllCategories((prev) =>
        prev.map((c) =>
          c.id === category.id ? { ...c, status: 'INACTIVE' as const } : c
        )
      );
    }
  };

  const handleModalSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      if (selectedCategory) {
        // Edit existing category
        setAllCategories((prev) =>
          prev.map((c) =>
            c.id === selectedCategory.id
              ? {
                  ...c,
                  name: data.name,
                  status: data.status,
                }
              : c
          )
        );
      } else {
        // Create new category
        const selectedEvent = events.find((e) => e.id === data.eventId);
        const newCategory: CategoryData = {
          id: Date.now().toString(),
          ...data,
          eventName: selectedEvent?.name || '',
          totalContestants: 0,
          totalVotes: 0,
          revenue: 0,
          createdAt: new Date().toISOString(),
        };
        setAllCategories((prev) => [newCategory, ...prev]);
      }

      setIsModalOpen(false);
      setSelectedCategory(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy as 'name' | 'created' | 'status');
    setSortOrder(newSortOrder as 'asc' | 'desc');
  };

  return (
    <ProtectedRouteWrapper
      requiredRole="admin"
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
                  <p className="text-xs sm:text-sm text-muted-foreground">Category Management</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Category Management
                  </h1>
                </div>
              </div>

              <Button
                onClick={handleCreateCategory}
                disabled={!selectedEventId || isLoading}
                className="gap-2 w-full sm:w-auto"
                size="lg"
              >
                <Plus className="h-5 w-5" />
                <span>Create Category</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Event Selector Section */}
          <div className="mb-8">
            <EventSelector
              events={events}
              value={selectedEventId}
              onChange={setSelectedEventId}
              isLoading={isLoading}
              placeholder="Select an event to manage categories"
              showLabel={true}
              className="max-w-md"
            />
            {!selectedEventId && !isLoading && (
              <p className="text-sm text-muted-foreground mt-2">
                Please select an event to manage categories.
              </p>
            )}
          </div>

          {/* Categories Summary */}
          {selectedEventId && (
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
                </p>
              </div>
            </div>
          )}

          {/* Categories Table */}
          {selectedEventId ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <CategoriesTable
                categories={filteredCategories}
                isLoading={isLoading}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onDeactivate={handleDeactivateCategory}
              />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <p className="text-muted-foreground mb-2">No event selected</p>
                <p className="text-xs text-muted-foreground">
                  Select an event from the dropdown above to view and manage its categories.
                </p>
              </div>
            </div>
          )}

          {/* Pagination Info */}
          {selectedEventId && filteredCategories.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing 1 to {Math.min(10, filteredCategories.length)} of {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
              </p>
            </div>
          )}
        </main>

        {/* Create/Edit Category Modal */}
        <CreateEditCategoryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCategory(undefined);
          }}
          onSubmit={handleModalSubmit}
          initialData={selectedCategory}
          initialEventId={selectedEventId}
          availableEvents={events}
          isLoading={isSubmitting}
        />
      </div>
    </ProtectedRouteWrapper>
  );
}

