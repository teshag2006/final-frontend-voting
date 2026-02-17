import { authenticateUser, getUserById, type User } from '@/lib/mock-users';

/**
 * Auth Service Layer
 * Separates authentication business logic from UI components
 * Enables easier testing, reusability, and migration
 */

export interface AuthResponse {
  success: boolean;
  user?: AuthTokenPayload;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface TokenData {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

class AuthService {
  private tokenRefreshInterval: NodeJS.Timeout | null = null;
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes

  /**
   * Login with email and password
   * Separates validation, authentication, and session management
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Validate inputs
      if (!this.validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      if (!this.validatePassword(password)) {
        return { success: false, error: 'Password must be at least 8 characters' };
      }

      // Authenticate user
      const user = authenticateUser(email, password);
      if (!user) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Create token payload
      const tokenPayload: AuthTokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      };

      // Generate tokens (in production, call backend)
      const tokens = this.generateTokens(tokenPayload);

      // Store tokens securely
      this.storeTokens(tokens);

      // Set up automatic token refresh
      this.setupTokenRefresh();

      return {
        success: true,
        user: tokenPayload,
        token: tokens.token,
        refreshToken: tokens.refreshToken,
        expiresIn: 3600, // 1 hour
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Logout - Clear tokens and cleanup
   */
  logout(): void {
    // Clear tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');

    // Clear cookies (in production)
    this.clearAuthCookies();

    // Stop token refresh
    this.stopTokenRefresh();

    // Clear user session
    localStorage.removeItem('auth_user_id');
    localStorage.removeItem('auth_user_role');
  }

  /**
   * Validate token expiry and refresh if needed
   */
  async validateToken(): Promise<boolean> {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return false;

    const expirationTime = parseInt(expiresAt, 10);
    const now = Date.now();

    // Token expired
    if (now > expirationTime) {
      this.logout();
      return false;
    }

    // Token expiring soon, refresh proactively
    if (now > expirationTime - this.TOKEN_EXPIRY_BUFFER) {
      await this.refreshToken();
    }

    return true;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      // In production, call backend refresh endpoint
      // const response = await fetch('/api/auth/refresh', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ refreshToken }),
      // });

      // For now, generate new token (mock)
      const userId = localStorage.getItem('auth_user_id');
      if (!userId) return false;

      const user = getUserById(userId);
      if (!user) return false;

      const tokenPayload: AuthTokenPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      };

      const newTokens = this.generateTokens(tokenPayload);
      this.storeTokens(newTokens);

      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Get stored user role
   */
  getUserRole(): string | null {
    return localStorage.getItem('auth_user_role');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Validate token with backend (optional - for added security)
   */
  async validateTokenWithBackend(token: string): Promise<boolean> {
    // In production:
    // const response = await fetch('/api/auth/validate', {
    //   headers: { Authorization: `Bearer ${token}` },
    // });
    // return response.ok;

    return true; // Mock
  }

  // ============ Private Helper Methods ============

  /**
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): boolean {
    return password.length >= 8;
  }

  /**
   * Generate JWT-like tokens (mock)
   */
  private generateTokens(payload: AuthTokenPayload): TokenData {
    // In production, call backend to generate JWT
    const expiresAt = Date.now() + 3600 * 1000; // 1 hour
    const token = this.createMockToken(payload);
    const refreshToken = this.createMockRefreshToken();

    return {
      token,
      refreshToken,
      expiresAt,
    };
  }

  /**
   * Create mock JWT token (for development)
   */
  private createMockToken(payload: AuthTokenPayload): string {
    // In production, backend returns real JWT
    return btoa(JSON.stringify(payload)) + '.' + Date.now();
  }

  /**
   * Create mock refresh token
   */
  private createMockRefreshToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Store tokens in secure storage
   */
  private storeTokens(tokens: TokenData): void {
    // Use localStorage for now (in production, use HttpOnly cookies)
    localStorage.setItem('auth_token', tokens.token);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    localStorage.setItem('token_expires_at', tokens.expiresAt.toString());
  }

  /**
   * Clear auth cookies (for production with HttpOnly cookies)
   */
  private clearAuthCookies(): void {
    // This would be handled by backend setting SameSite=Strict, Secure, HttpOnly
    if (typeof document !== 'undefined') {
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    }
  }

  /**
   * Set up automatic token refresh before expiry
   */
  private setupTokenRefresh(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
    }

    // Refresh token every 50 minutes (token expires in 60)
    this.tokenRefreshInterval = setInterval(() => {
      this.refreshToken();
    }, 50 * 60 * 1000);
  }

  /**
   * Stop automatic token refresh
   */
  private stopTokenRefresh(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
