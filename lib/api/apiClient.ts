import { authService } from '@/lib/services/authService';

/**
 * Centralized API Client
 * Handles:
 * - Request/response formatting
 * - Error handling
 * - Token management
 * - CSRF protection
 * - Retry logic
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface ApiErrorResponse {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

class ApiClient {
  private baseUrl: string;
  private retryAttempts = 3;
  private retryDelay = 1000; // ms

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(url: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(url: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Core request method with error handling and retries
   */
  private async request<T = unknown>(
    url: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<ApiResponse<T>> {
    try {
      // Prepare request
      const fullUrl = this.buildUrl(url);
      const requestInit = this.prepareRequest(options);

      // Validate token before request
      const isTokenValid = await authService.validateToken();
      if (!isTokenValid && !url.includes('/auth/')) {
        return {
          success: false,
          error: 'Authentication token expired',
          statusCode: 401,
        };
      }

      // Execute request
      const response = await fetch(fullUrl, requestInit);

      // Handle response
      return await this.handleResponse<T>(response);
    } catch (error) {
      // Retry logic for network errors
      if (attempt < this.retryAttempts && this.isRetryableError(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.request<T>(url, options, attempt + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        statusCode: 0,
      };
    }
  }

  /**
   * Prepare request with headers and auth token
   */
  private prepareRequest(options: RequestInit): RequestInit {
    const headers = new Headers(options.headers || {});

    // Set content type
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    // Add auth token
    const token = authService.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Add CSRF token (if available)
    const csrfToken = this.getCsrfToken();
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }

    // Add request ID for tracking
    headers.set('X-Request-ID', this.generateRequestId());

    return {
      ...options,
      headers,
      credentials: 'include', // Include cookies
    };
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');

    // Handle non-JSON responses
    if (!contentType?.includes('application/json')) {
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}`,
          statusCode: response.status,
        };
      }

      return {
        success: true,
        statusCode: response.status,
      };
    }

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to parse response',
        statusCode: response.status,
      };
    }

    // Handle error responses
    if (!response.ok) {
      // 401 Unauthorized - refresh token or logout
      if (response.status === 401) {
        const refreshed = await authService.refreshToken();
        if (!refreshed) {
          authService.logout();
        }
      }

      // Extract error message
      const errorMessage =
        (data as any)?.error ||
        (data as any)?.message ||
        `HTTP ${response.status}`;

      return {
        success: false,
        error: errorMessage,
        statusCode: response.status,
      };
    }

    return {
      success: true,
      data: data as T,
      statusCode: response.status,
    };
  }

  /**
   * Build full URL
   */
  private buildUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }

    return `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('failed to fetch')
    );
  }

  /**
   * Delay for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get CSRF token from meta tag
   */
  private getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null;

    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    return token || null;
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
