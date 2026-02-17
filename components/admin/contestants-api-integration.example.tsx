/**
 * CONTESTANTS API INTEGRATION EXAMPLES
 *
 * This file shows how to integrate the contestant management system
 * with a real backend API. Use these patterns when replacing mock data.
 *
 * DO NOT include this file in production - it's for reference only.
 */

import { useState, useCallback } from 'react';
import type { ContestantData } from './contestants-table';
import type { ContestantFormData } from './create-edit-contestant-modal';

/**
 * API CLIENT CONFIGURATION
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_ENDPOINTS = {
  LIST: '/api/admin/contestants',
  CREATE: '/api/admin/contestants',
  UPDATE: (id: string) => `/api/admin/contestants/${id}`,
  DELETE: (id: string) => `/api/admin/contestants/${id}`,
  CHANGE_STATUS: (id: string) => `/api/admin/contestants/${id}/status`,
  EXPORT: '/api/admin/contestants/export',
};

/**
 * HELPER: Get Authorization Header
 */
function getAuthHeader(): { Authorization: string } {
  const token = localStorage.getItem('auth_token') || '';
  return { Authorization: `Bearer ${token}` };
}

/**
 * EXAMPLE 1: Fetch Contestants (List)
 */
export async function fetchContestants(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const searchParams = new URLSearchParams();

  if (options.page) searchParams.append('page', String(options.page));
  if (options.limit) searchParams.append('limit', String(options.limit));
  if (options.search) searchParams.append('search', options.search);
  if (options.category) searchParams.append('category', options.category);
  if (options.status) searchParams.append('status', options.status);
  if (options.dateFrom) searchParams.append('dateFrom', options.dateFrom);
  if (options.dateTo) searchParams.append('dateTo', options.dateTo);

  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.LIST}?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch contestants: ${response.statusText}`);
  }

  return response.json();
}

/**
 * EXAMPLE 2: Create Contestant
 */
export async function createContestant(data: ContestantFormData) {
  const formData = new FormData();

  formData.append('name', data.name);
  if (data.bio) formData.append('bio', data.bio);
  formData.append('category', data.category);
  if (data.status) formData.append('status', data.status);

  // Handle image upload (convert base64 to File or send URL directly)
  if (data.avatar) {
    // Option A: Send as data URL (simple but larger payload)
    formData.append('avatar', data.avatar);

    // Option B: Upload to storage service first, then send URL
    // const url = await uploadToStorage(data.avatar);
    // formData.append('avatarUrl', url);
  }

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREATE}`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to create contestant: ${response.statusText}`);
  }

  return response.json();
}

/**
 * EXAMPLE 3: Update Contestant
 */
export async function updateContestant(id: string, data: Partial<ContestantFormData>) {
  const body: Record<string, any> = {};

  if (data.name) body.name = data.name;
  if (data.bio !== undefined) body.bio = data.bio;
  if (data.category) body.category = data.category;
  if (data.status) body.status = data.status;
  if (data.avatar) body.avatar = data.avatar;

  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to update contestant: ${response.statusText}`);
  }

  return response.json();
}

/**
 * EXAMPLE 4: Delete Contestant
 */
export async function deleteContestant(id: string) {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DELETE(id)}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete contestant: ${response.statusText}`);
  }

  return response.json();
}

/**
 * EXAMPLE 5: Change Contestant Status
 */
export async function changeContestantStatus(id: string, status: string) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.CHANGE_STATUS(id)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to change status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * EXAMPLE 6: Export Contestants to CSV
 */
export async function exportContestants(filters?: {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const searchParams = new URLSearchParams();

  if (filters?.search) searchParams.append('search', filters.search);
  if (filters?.category) searchParams.append('category', filters.category);
  if (filters?.status) searchParams.append('status', filters.status);
  if (filters?.dateFrom) searchParams.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) searchParams.append('dateTo', filters.dateTo);

  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.EXPORT}?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: getAuthHeader(),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to export contestants: ${response.statusText}`);
  }

  // Return blob for download
  return response.blob();
}

/**
 * EXAMPLE 7: Hook - Use Contestants Data
 */
export function useContestants(initialPage = 1, initialLimit = 10) {
  const [contestants, setContestants] = useState<ContestantData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);

  const fetchData = useCallback(
    async (filters?: Record<string, any>) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchContestants({
          page,
          limit: initialLimit,
          ...filters,
        });

        setContestants(data.items);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [page, initialLimit]
  );

  return {
    contestants,
    isLoading,
    error,
    total,
    page,
    setPage,
    refetch: fetchData,
  };
}

/**
 * EXAMPLE 8: Hook - Create Contestant
 */
export function useCreateContestant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (data: ContestantFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createContestant(data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, isLoading, error };
}

/**
 * EXAMPLE 9: Hook - Update Contestant
 */
export function useUpdateContestant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: string, data: Partial<ContestantFormData>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await updateContestant(id, data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { update, isLoading, error };
}

/**
 * EXAMPLE 10: Hook - Delete Contestant
 */
export function useDeleteContestant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const delete_ = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteContestant(id);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { delete: delete_, isLoading, error };
}

/**
 * MIGRATION GUIDE
 *
 * 1. Install dependencies:
 *    npm install @tanstack/react-query
 *
 * 2. In your page.tsx, replace mock data:
 *
 *    BEFORE:
 *    const mockContestants = generateMockContestants();
 *
 *    AFTER:
 *    const { contestants, isLoading } = useContestants();
 *
 * 3. Replace mutation handlers:
 *
 *    BEFORE:
 *    setAllContestants(prev => [...prev, newContestant]);
 *
 *    AFTER:
 *    const { create } = useCreateContestant();
 *    await create(formData);
 *    refetch(); // Refresh list
 *
 * 4. Add error handling:
 *    if (error) {
 *      showToast({ message: error, type: 'error' });
 *    }
 *
 * 5. Add optimistic updates:
 *    Update UI immediately, then sync with server
 *
 * 6. Add caching layer:
 *    Use React Query or SWR for automatic cache management
 */

/**
 * EXPECTED API RESPONSES
 */

/**
 * GET /api/admin/contestants
 * Response:
 * {
 *   items: [
 *     {
 *       id: "#5000",
 *       name: "Sophie Turner",
 *       bio: "...",
 *       category: "Solo Vocalists",
 *       categoryId: "cat-1",
 *       status: "APPROVED",
 *       totalVotes: 1640,
 *       revenue: 820.00,
 *       createdAt: "2024-03-10T15:10:00Z",
 *       avatar: "https://..."
 *     }
 *   ],
 *   total: 120,
 *   page: 1,
 *   limit: 10
 * }
 */

/**
 * POST /api/admin/contestants
 * Response:
 * {
 *   id: "#5120",
 *   name: "New Contestant",
 *   ...
 *   status: "PENDING",
 *   totalVotes: 0,
 *   revenue: 0,
 *   createdAt: "2024-03-10T15:30:00Z"
 * }
 */

/**
 * PATCH /api/admin/contestants/:id
 * Response:
 * {
 *   id: "#5000",
 *   name: "Updated Name",
 *   ...
 * }
 */

/**
 * DELETE /api/admin/contestants/:id
 * Response:
 * {
 *   message: "Contestant deleted successfully",
 *   id: "#5000"
 * }
 */

/**
 * PATCH /api/admin/contestants/:id/status
 * Response:
 * {
 *   id: "#5000",
 *   status: "APPROVED"
 * }
 */
