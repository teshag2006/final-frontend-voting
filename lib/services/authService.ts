import type { AuthUser, UserRole } from '@/lib/types';
import { getAuthProfile, loginWithBackend, registerWithBackend } from '@/lib/api';

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  refreshToken?: string;
  error?: string;
}

class AuthService {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  getUserRole(): UserRole | null {
    if (typeof window === 'undefined') return null;
    return (localStorage.getItem('auth_user_role') as UserRole | null) || null;
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  async validateToken(): Promise<boolean> {
    return this.isAuthenticated();
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    if (!refreshToken) return false;
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) return false;
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: 'no-store',
      });
      const payload = await res.json().catch(() => null);
      const accessToken = payload?.data?.access_token;
      if (!accessToken) return false;
      localStorage.setItem('auth_token', accessToken);
      const nextRefreshToken = payload?.data?.refresh_token;
      if (nextRefreshToken) {
        localStorage.setItem('refresh_token', nextRefreshToken);
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const data = await loginWithBackend(email, password);
      const user: AuthUser = {
        id: String(data.user.id),
        email: data.user.email,
        name: data.user.full_name || data.user.email,
        role: data.user.role,
        avatar: data.user.avatar_url || undefined,
      };

      this.persistSession(data.access_token, data.refresh_token, user);
      return {
        success: true,
        user,
        token: data.access_token,
        refreshToken: data.refresh_token,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  async signup(payload: {
    name: string;
    email: string;
    password: string;
    role: Exclude<UserRole, 'admin' | 'media' | 'public'>;
    gender?: string;
  }): Promise<AuthResponse> {
    try {
      const data = await registerWithBackend({
        full_name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        gender: payload.gender,
      });

      const user: AuthUser = {
        id: String(data.user.id),
        email: data.user.email,
        name: data.user.full_name || data.user.email,
        role: data.user.role,
        avatar: data.user.avatar_url || undefined,
      };

      this.persistSession(data.access_token, data.refresh_token, user);
      return {
        success: true,
        user,
        token: data.access_token,
        refreshToken: data.refresh_token,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  }

  async getProfile(): Promise<AuthUser | null> {
    const token = this.getToken() || undefined;
    if (!token) return null;
    return getAuthProfile(token);
  }

  logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user_id');
    localStorage.removeItem('auth_user_role');
    localStorage.removeItem('auth_user_cache');
    localStorage.removeItem('auth_impersonation_user');

    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  private persistSession(
    accessToken: string,
    refreshToken: string,
    user: AuthUser
  ) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('auth_user_id', user.id);
    localStorage.setItem('auth_user_role', user.role);
    localStorage.setItem('auth_user_cache', JSON.stringify(user));

    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `auth_token=${encodeURIComponent(accessToken)}; path=/; SameSite=Lax${secureFlag}`;
    document.cookie = `user_role=${encodeURIComponent(user.role)}; path=/; SameSite=Lax${secureFlag}`;
  }
}

export const authService = new AuthService();
