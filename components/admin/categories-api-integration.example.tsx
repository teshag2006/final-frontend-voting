/**
 * ADMIN CATEGORIES - API INTEGRATION EXAMPLES
 * 
 * This file shows how to replace mock data with real API calls
 * Copy patterns from here into your actual implementation
 * 
 * DO NOT USE THIS FILE IN PRODUCTION
 * This is for reference only
 */

// ============================================================================
// EXAMPLE 1: Load Events for Selector
// ============================================================================

import { useEffect, useState } from 'react';

export function useLoadEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          '/api/v1/admin/events?status=ACTIVE,UPCOMING',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // Add auth token if needed
              // 'Authorization': `Bearer ${token}`
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to load events: ${response.statusText}`);
        }

        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error loading events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  return { events, isLoading, error };
}

// ============================================================================
// EXAMPLE 2: Load Categories for Selected Event
// ============================================================================

export function useLoadCategories(eventId: string | null) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setCategories([]);
      return;
    }

    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/v1/admin/categories?eventId=${eventId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to load categories: ${response.statusText}`);
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error loading categories:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [eventId]);

  return { categories, isLoading, error };
}

// ============================================================================
// EXAMPLE 3: Create Category
// ============================================================================

interface CreateCategoryPayload {
  name: string;
  eventId: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export async function createCategory(
  payload: CreateCategoryPayload
): Promise<any> {
  const response = await fetch('/api/v1/admin/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to create category: ${response.statusText}`);
  }

  return response.json();
}

// Usage in modal submit handler:
/*
const handleModalSubmit = async (data: CategoryFormData) => {
  try {
    await createCategory({
      name: data.name,
      eventId: data.eventId,
      status: data.status,
    });
    
    // Refetch categories
    const newCategories = await fetch(`/api/v1/admin/categories?eventId=${data.eventId}`).then(r => r.json());
    setAllCategories(newCategories);
    
    onClose();
  } catch (error) {
    console.error('Error:', error);
    // Show error toast/notification
  }
};
*/

// ============================================================================
// EXAMPLE 4: Update Category
// ============================================================================

interface UpdateCategoryPayload {
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export async function updateCategory(
  categoryId: string,
  payload: UpdateCategoryPayload
): Promise<any> {
  const response = await fetch(`/api/v1/admin/categories/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to update category: ${response.statusText}`);
  }

  return response.json();
}

// Usage:
/*
const handleEditCategory = async (categoryId: string, data: CategoryFormData) => {
  try {
    await updateCategory(categoryId, {
      name: data.name,
      status: data.status,
    });
    
    // Refetch and update UI
    setAllCategories(prev => 
      prev.map(c => 
        c.id === categoryId 
          ? { ...c, name: data.name, status: data.status }
          : c
      )
    );
  } catch (error) {
    console.error('Error:', error);
  }
};
*/

// ============================================================================
// EXAMPLE 5: Change Category Status
// ============================================================================

export async function changeCategoryStatus(
  categoryId: string,
  newStatus: 'ACTIVE' | 'INACTIVE'
): Promise<any> {
  const response = await fetch(
    `/api/v1/admin/categories/${categoryId}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to change status: ${response.statusText}`);
  }

  return response.json();
}

// Usage:
/*
const handleDeactivate = async (categoryId: string) => {
  try {
    await changeCategoryStatus(categoryId, 'INACTIVE');
    
    setAllCategories(prev =>
      prev.map(c =>
        c.id === categoryId
          ? { ...c, status: 'INACTIVE' }
          : c
      )
    );
  } catch (error) {
    console.error('Error:', error);
  }
};
*/

// ============================================================================
// EXAMPLE 6: Delete Category
// ============================================================================

export async function deleteCategory(categoryId: string): Promise<void> {
  const response = await fetch(`/api/v1/admin/categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Failed to delete category: ${response.statusText}`);
  }
}

// Usage:
/*
const handleDeleteCategory = async (categoryId: string) => {
  if (!confirm('Are you sure you want to delete this category?')) {
    return;
  }

  try {
    await deleteCategory(categoryId);
    
    setAllCategories(prev =>
      prev.filter(c => c.id !== categoryId)
    );
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to delete category');
  }
};
*/

// ============================================================================
// EXAMPLE 7: Custom Hook for Categories CRUD
// ============================================================================

export function useCategoriesCRUD(eventId: string | null) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    if (!eventId) {
      setCategories([]);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/admin/categories?eventId=${eventId}`);
        if (!response.ok) throw new Error('Failed to load');
        const data = await response.json();
        setCategories(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [eventId]);

  // Create
  const create = async (payload: CreateCategoryPayload) => {
    try {
      const result = await createCategory(payload);
      setCategories((prev) => [result, ...prev]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
      throw err;
    }
  };

  // Update
  const update = async (categoryId: string, payload: UpdateCategoryPayload) => {
    try {
      const result = await updateCategory(categoryId, payload);
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? result : c))
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
      throw err;
    }
  };

  // Delete
  const remove = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      throw err;
    }
  };

  // Change status
  const changeStatus = async (
    categoryId: string,
    status: 'ACTIVE' | 'INACTIVE'
  ) => {
    try {
      const result = await changeCategoryStatus(categoryId, status);
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? result : c))
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      throw err;
    }
  };

  return {
    categories,
    isLoading,
    error,
    create,
    update,
    remove,
    changeStatus,
  };
}

// Usage in page:
/*
export default function AdminCategoriesPage() {
  const { categories, isLoading, create, update, remove, changeStatus } = useCategoriesCRUD(selectedEventId);
  
  // Use these methods instead of mock handlers
}
*/

// ============================================================================
// EXAMPLE 8: Error Handling & Retry Logic
// ============================================================================

export async function createCategoryWithRetry(
  payload: CreateCategoryPayload,
  maxRetries = 3
): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await createCategory(payload);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ============================================================================
// EXAMPLE 9: Request with Abort Controller
// ============================================================================

export function useLoadCategoriesWithAbort(eventId: string | null) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setCategories([]);
      return;
    }

    const abortController = new AbortController();

    const load = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/v1/admin/categories?eventId=${eventId}`,
          {
            signal: abortController.signal,
          }
        );

        if (!response.ok) throw new Error('Failed to load');

        const data = await response.json();
        
        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setCategories(data);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error loading categories:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    load();

    // Cleanup: abort request if component unmounts
    return () => abortController.abort();
  }, [eventId]);

  return { categories, isLoading };
}

// ============================================================================
// NOTES FOR IMPLEMENTATION
// ============================================================================

/*
1. Replace all mock data calls with these functions
2. Update error handling in your UI (use toast/notification)
3. Add request logging/monitoring
4. Implement proper auth token management
5. Add request/response interceptors if needed
6. Test all error scenarios
7. Add loading skeletons during data fetch
8. Implement proper cleanup on component unmount (abort controllers)
9. Consider caching strategies (SWR, React Query)
10. Add rate limiting handling (429 responses)

Security considerations:
- Validate all user inputs before sending to API
- Use HTTPS only
- Include CSRF tokens if needed
- Sanitize API responses before using in UI
- Never log sensitive data
- Implement proper error boundaries
*/
