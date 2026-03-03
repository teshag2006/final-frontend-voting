import type {
  ApiEnvelope,
  AuthUser,
  BackendAuthLoginResponse,
  BackendCategory,
  BackendContestant,
  BackendEvent,
  BackendLeaderboardEntry,
  BackendVoterWallet,
  PaginatedResult,
  PaginationMeta,
  UiCategory,
  UiContestant,
  UiEvent,
  UiLeaderboardEntry,
  UserRole,
} from '@/lib/types';

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
const LOGIN_PATH = '/login';

type ApiFetchOptions = RequestInit & {
  skipAuthRedirect?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function resolveApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      'NEXT_PUBLIC_BACKEND_URL (or NEXT_PUBLIC_API_URL) is not configured.'
    );
  }
  return API_URL.replace(/\/$/, '');
}

function getBrowserToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('auth_token') || undefined;
}

function clearClientSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('auth_user_id');
  localStorage.removeItem('auth_user_role');
  localStorage.removeItem('auth_user_cache');
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;
  const current = `${window.location.pathname}${window.location.search}`;
  if (window.location.pathname.startsWith(LOGIN_PATH)) return;
  const next = encodeURIComponent(current);
  window.location.assign(`${LOGIN_PATH}?next=${next}`);
}

function toHeaders(headers?: HeadersInit): Headers {
  return new Headers(headers || {});
}

function toPaginationMeta(
  pagination: PaginationMeta | undefined,
  fallbackTotal: number
): PaginationMeta {
  const page = Number(pagination?.page || 1);
  const limit = Number(pagination?.limit || fallbackTotal || 0);
  const total = Number(pagination?.total || fallbackTotal || 0);
  const pages =
    Number(
      pagination?.pages || pagination?.total_pages || pagination?.totalPages || 0
    ) || (limit > 0 ? Math.ceil(total / limit) : 1);
  return {
    page,
    limit,
    total,
    pages,
    total_pages: pages,
    totalPages: pages,
    hasNextPage: page < pages,
    hasPrevPage: page > 1,
  };
}

async function unwrapEnvelope<T>(res: Response): Promise<T> {
  const payload = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok) {
    const message =
      (payload as { message?: string } | null)?.message ||
      `API error (${res.status})`;
    throw new ApiError(message, res.status);
  }

  if (!payload || !('data' in payload)) {
    throw new ApiError('Invalid API envelope response', res.status);
  }
  return payload.data;
}

async function unwrapEnvelopeWithPagination<T>(res: Response): Promise<PaginatedResult<T>> {
  const payload = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!res.ok) {
    const message =
      (payload as { message?: string } | null)?.message ||
      `API error (${res.status})`;
    throw new ApiError(message, res.status);
  }
  if (!payload || !('data' in payload)) {
    throw new ApiError('Invalid API envelope response', res.status);
  }

  const items = Array.isArray(payload.data)
    ? payload.data
    : ((payload.data as { data?: T[] })?.data ?? []);
  const pagination = toPaginationMeta(payload.pagination, items.length);

  return { items, pagination };
}

async function tryRefreshToken(): Promise<string | undefined> {
  if (typeof window === 'undefined') return undefined;
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return undefined;

  try {
    const res = await fetch(`${resolveApiUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: 'no-store',
    });
    const data = await unwrapEnvelope<{
      access_token: string;
      refresh_token?: string;
    }>(res);
    localStorage.setItem('auth_token', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    return data.access_token;
  } catch {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    return undefined;
  }
}

async function requestWithAuthRetry<T>(
  endpoint: string,
  options: ApiFetchOptions,
  token?: string,
  withPagination = false
): Promise<T> {
  const { skipAuthRedirect, ...requestOptions } = options;
  const headers = toHeaders(requestOptions.headers);
  if (!headers.has('Content-Type') && requestOptions.body) {
    headers.set('Content-Type', 'application/json');
  }

  const authToken = token || getBrowserToken();
  const request = async (auth?: string) =>
    fetch(`${resolveApiUrl()}${endpoint}`, {
      ...requestOptions,
      headers: auth
        ? new Headers({
            ...Object.fromEntries(headers.entries()),
            Authorization: `Bearer ${auth}`,
          })
        : headers,
      cache: 'no-store',
    });

  let res = await request(authToken);

  if (res.status === 401 && !token) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      res = await request(refreshed);
    }
  }

  if (res.status === 401 && !skipAuthRedirect && typeof window !== 'undefined') {
    clearClientSession();
    redirectToLogin();
  }

  if (withPagination) {
    return (await unwrapEnvelopeWithPagination<T>(res)) as T;
  }

  return unwrapEnvelope<T>(res);
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
  token?: string
): Promise<T> {
  return requestWithAuthRetry<T>(endpoint, options, token, false);
}

export async function apiFetchPaginated<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
  token?: string
): Promise<PaginatedResult<T>> {
  return requestWithAuthRetry<PaginatedResult<T>>(endpoint, options, token, true);
}

function toSlug(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback;
  return value;
}

function toName(contestant: BackendContestant): string {
  if (contestant.full_name) return contestant.full_name;
  const first = contestant.first_name || '';
  const last = contestant.last_name || '';
  const joined = `${first} ${last}`.trim();
  return joined || 'Contestant';
}

export function transformEvent(data: BackendEvent): UiEvent {
  return {
    id: String(data.id),
    slug: data.slug,
    name: data.name,
    tagline: data.tagline || undefined,
    description: data.description || undefined,
    status: data.status,
    banner_url: data.banner_url || undefined,
    start_date: data.start_date || undefined,
    end_date: data.end_date || undefined,
    voting_start: data.voting_start || undefined,
    voting_end: data.voting_end || undefined,
    registration_start: data.registration_start || undefined,
    registration_end: data.registration_end || undefined,
    voting_rules: data.voting_rules || undefined,
    organizer_name: data.organizer_name || undefined,
    location: data.location || undefined,
    vote_price: typeof data.vote_price === 'number' ? data.vote_price : undefined,
    revenue_share_disclosure: data.revenue_share_disclosure || undefined,
  };
}

export function transformCategory(data: BackendCategory): UiCategory {
  return {
    id: String(data.id),
    event_id:
      typeof data.event_id === 'number' ? String(data.event_id) : undefined,
    name: data.name,
    description: data.description || undefined,
    slug: toSlug(data.slug, String(data.id)),
  };
}

export function transformContestant(data: BackendContestant): UiContestant {
  const image =
    data.profile_image_url || data.photo_url || data.image_url || '/placeholder.svg';
  const votes = Number(data.total_votes || 0);
  const slug = toSlug(data.slug, String(data.id));

  return {
    id: String(data.id),
    slug,
    name: toName(data),
    image_url: image,
    photo_url: image,
    votes,
    total_votes: votes,
    rank: typeof data.rank === 'number' ? data.rank : undefined,
    country: data.country || undefined,
    category_id:
      data.category_id !== undefined && data.category_id !== null
        ? String(data.category_id)
        : undefined,
    category: data.category || data.category_name || undefined,
    category_name: data.category_name || data.category || undefined,
    is_verified: Boolean(data.is_verified),
  };
}

export function transformLeaderboardEntry(
  data: BackendLeaderboardEntry,
  rank: number
): UiLeaderboardEntry {
  const fullName = data.contestantName || data.contestant_name || 'Contestant';
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Contestant';
  const lastName = nameParts.slice(1).join(' ') || '';
  const totalVotes = Number(data.totalVotes || data.total_votes || 0);
  const profileImage = data.profileImage || data.profile_image_url || '/placeholder.svg';
  return {
    contestantId: String(data.contestantId || data.contestant_id || ''),
    contestantName: fullName,
    firstName,
    lastName,
    categoryId: data.categoryId
      ? String(data.categoryId)
      : data.category_id
        ? String(data.category_id)
        : undefined,
    categoryName: data.categoryName || data.category_name || undefined,
    profileImage,
    profileImageUrl: profileImage,
    freeVotes: Math.round(totalVotes * 0.2),
    paidVotes: Math.round(totalVotes * 0.8),
    totalVotes,
    rank: Number(data.rank || rank),
    votePercentage: undefined,
    trend: 'neutral',
    last24hChange: 0,
    totalRevenue: 0,
    verified: true,
  };
}

export async function getAllEvents(options?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.status) params.set('status', options.status);
    params.set('isPublic', 'true');
    const qs = params.toString();
    const result = await apiFetchPaginated<BackendEvent>(
      `/events${qs ? `?${qs}` : ''}`
    );
    return {
      items: result.items.map(transformEvent),
      pagination: result.pagination,
    };
  } catch {
    return { items: [], pagination: { page: 1, limit: 0, total: 0, pages: 1 } };
  }
}

export async function getActiveEvent(): Promise<UiEvent | null> {
  try {
    const data = await apiFetch<BackendEvent | null>('/public/active-event');
    return data ? transformEvent(data) : null;
  } catch {
    return null;
  }
}

export async function getEventBySlug(slug: string): Promise<UiEvent | null> {
  try {
    const data = await apiFetch<BackendEvent>(`/public/event/${slug}`);
    return transformEvent(data);
  } catch {
    return null;
  }
}

export async function getEventStats(slug: string): Promise<any | null> {
  try {
    return await apiFetch<any>(`/public/event/${slug}/stats`);
  } catch {
    return null;
  }
}

export async function getEventCategories(
  slug: string,
  options?: { page?: number; limit?: number }
): Promise<UiCategory[]> {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));
    const qs = params.toString();
    const result = await apiFetchPaginated<BackendCategory>(
      `/public/event/${slug}/categories${qs ? `?${qs}` : ''}`
    );
    return result.items.map(transformCategory);
  } catch {
    return [];
  }
}

export async function getEventContestants(
  slug: string,
  options?: { page?: number; limit?: number }
): Promise<UiContestant[]> {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));
    const qs = params.toString();
    const result = await apiFetchPaginated<BackendContestant>(
      `/public/event/${slug}/contestants${qs ? `?${qs}` : ''}`
    );
    return result.items.map(transformContestant);
  } catch {
    return [];
  }
}

export async function getEventContestantsPaginated(
  slug: string,
  options?: { page?: number; limit?: number }
): Promise<PaginatedResult<UiContestant>> {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));
    const qs = params.toString();
    const result = await apiFetchPaginated<BackendContestant>(
      `/public/event/${slug}/contestants${qs ? `?${qs}` : ''}`
    );
    return {
      items: result.items.map(transformContestant),
      pagination: result.pagination,
    };
  } catch {
    return { items: [], pagination: { page: 1, limit: 0, total: 0, pages: 1 } };
  }
}

export async function getEventLeaderboard(
  slug: string,
  limit = 100,
  categoryId?: string
): Promise<UiLeaderboardEntry[]> {
  try {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (categoryId) params.set('categoryId', categoryId);
    const rows = await apiFetch<BackendLeaderboardEntry[]>(
      `/public/event/${slug}/leaderboard?${params.toString()}`
    );
    return (rows || []).map((row, index) =>
      transformLeaderboardEntry(row, index + 1)
    );
  } catch {
    return [];
  }
}

export async function getEventFAQ(slug: string): Promise<any[]> {
  try {
    return await apiFetch<any[]>(`/public/event/${slug}/faq`);
  } catch {
    return [];
  }
}

export async function getEventSponsorsPublic(eventSlug: string): Promise<any[]> {
  try {
    return await apiFetch<any[]>(`/public/event/${eventSlug}/sponsors`);
  } catch {
    return [];
  }
}

export async function getContestantSponsorsPublic(
  eventSlug: string,
  contestantSlug: string
): Promise<any[]> {
  try {
    return await apiFetch<any[]>(
      `/public/event/${eventSlug}/contestant/${contestantSlug}/sponsors`
    );
  } catch {
    return [];
  }
}

export async function getContestantProfile(
  eventSlug: string,
  contestantSlug: string
): Promise<UiContestant | null> {
  try {
    const data = await apiFetch<BackendContestant>(
      `/public/event/${eventSlug}/contestant/${contestantSlug}`
    );
    return transformContestant(data);
  } catch {
    return null;
  }
}

export async function getPublicCategoryInfo(categoryId: string): Promise<any | null> {
  try {
    return await apiFetch<any>(`/public/category-info/${categoryId}`);
  } catch {
    return null;
  }
}

export async function getPublicCategoryContestants(
  categoryId: string,
  options?: { page?: number; limit?: number; sort?: string; country?: string }
): Promise<PaginatedResult<UiContestant>> {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.sort) params.set('sort', options.sort);
    if (options?.country) params.set('country', options.country);
    const qs = params.toString();
    const data = await apiFetchPaginated<BackendContestant>(
      `/public/category-contestants/${categoryId}${qs ? `?${qs}` : ''}`
    );
    return {
      items: data.items.map(transformContestant),
      pagination: data.pagination,
    };
  } catch {
    return { items: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } };
  }
}

export async function getPublicReceipt(
  receiptNumber: string
): Promise<any | null> {
  try {
    return await apiFetch<any>(
      `/public/notifications/receipt/${encodeURIComponent(receiptNumber)}`
    );
  } catch {
    return null;
  }
}

export async function getPublicVerification(
  receiptNumber: string
): Promise<any> {
  try {
    return await apiFetch<any>(
      `/public/blockchain/verify-vote/${encodeURIComponent(receiptNumber)}`
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        error: true,
        message: error.message,
        status: error.status,
      };
    }
    return {
      error: true,
      message: 'Verification failed',
      status: 500,
    };
  }
}

export async function loginWithBackend(email: string, password: string) {
  return apiFetch<BackendAuthLoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuthRedirect: true,
  });
}

export async function registerWithBackend(payload: {
  full_name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'public'>;
  gender?: string;
}) {
  const parts = String(payload.full_name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const first_name = parts[0] || 'User';
  const last_name = parts.slice(1).join(' ') || 'Account';

  await apiFetch<{ id: number | string; email: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      first_name,
      last_name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      gender: payload.gender,
    }),
    skipAuthRedirect: true,
  });

  return loginWithBackend(payload.email, payload.password);
}

export async function getAuthProfile(token?: string): Promise<AuthUser | null> {
  try {
    const data = await apiFetch<any>('/auth/profile', {}, token);
    return {
      id: String(data.id),
      email: String(data.email || ''),
      name: String(data.full_name || data.name || 'User'),
      role: data.role as UserRole,
      avatar: data.avatar_url || undefined,
    };
  } catch {
    return null;
  }
}

export async function getVoterDashboard(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/voter/dashboard', {}, token);
  } catch {
    return null;
  }
}

export async function getVoterWallet(token?: string): Promise<BackendVoterWallet | null> {
  try {
    return await apiFetch<BackendVoterWallet>('/voter/wallet', {}, token);
  } catch {
    return null;
  }
}

export async function getVoterPayments(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/voter/payments', {}, token);
  } catch {
    return null;
  }
}

export async function getVoterVotes(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/voter/my-votes', {}, token);
  } catch {
    return null;
  }
}

export async function createCheckoutSession(
  payload: { contestantId: string; quantity: number },
  token?: string
): Promise<{ unitPrice: number; totalAmount: number; transactionToken: string } | null> {
  try {
    return await apiFetch<{ unitPrice: number; totalAmount: number; transactionToken: string }>(
      '/payments/checkout-session',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  } catch {
    return null;
  }
}

export async function getVoterProfile(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/voter/profile', {}, token);
  } catch {
    return null;
  }
}

export async function updateVoterProfile(
  fullName: string,
  token?: string
): Promise<any | null> {
  try {
    return await apiFetch<any>(
      '/voter/profile',
      {
        method: 'PATCH',
        body: JSON.stringify({ fullName }),
      },
      token
    );
  } catch {
    return null;
  }
}

export async function triggerPhoneVerification(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>(
      '/voter/verify-phone',
      { method: 'POST' },
      token
    );
  } catch {
    return null;
  }
}

export async function submitVoterVote(
  payload: {
    categoryId: string;
    contestantId?: string;
    isPaid: boolean;
    quantity?: number;
  },
  token?: string
): Promise<any | null> {
  try {
    return await apiFetch<any>(
      '/voter/vote',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  } catch {
    return null;
  }
}

export async function deleteVoterAccount(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/voter/account', { method: 'DELETE' }, token);
  } catch {
    return null;
  }
}

export async function getDashboardOverview(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/contestant/dashboard/overview', {}, token);
  } catch {
    return null;
  }
}

export async function getContestantReadiness(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/contestant/readiness', {}, token);
  } catch {
    return null;
  }
}

export async function getContestantProfileData(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/contestant/profile', {}, token);
  } catch {
    return null;
  }
}

export async function getRankingData(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/contestant/ranking', {}, token);
  } catch {
    return null;
  }
}

export async function getAnalyticsData(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/contestant/analytics', {}, token);
  } catch {
    return null;
  }
}

export async function getRevenueData(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/contestant/revenue', {}, token);
  } catch {
    return null;
  }
}

export async function getSecurityData(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/contestant/security', {}, token);
  } catch {
    return null;
  }
}

export async function getGeographicData(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/contestant/geographic', {}, token);
  } catch {
    return null;
  }
}

export async function getSponsorsData(token?: string): Promise<any[] | null> {
  try {
    return await apiFetch<any[]>('/contestant/sponsors', {}, token);
  } catch {
    return null;
  }
}

export async function getEventDetails(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/contestant/event', {}, token);
  } catch {
    return null;
  }
}

export async function getNotifications(token?: string): Promise<any[] | null> {
  try {
    return await apiFetch<any[]>('/contestant/notifications', {}, token);
  } catch {
    return null;
  }
}

export async function getContestantPriorityNotifications(
  token?: string
): Promise<any[] | null> {
  try {
    return await apiFetch<any[]>('/contestant/notifications-priority', {}, token);
  } catch {
    return null;
  }
}

export async function getAdminDashboard(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/admin/dashboard', {}, token);
  } catch {
    return null;
  }
}

export async function getAdminSponsors(token?: string): Promise<any[] | null> {
  try {
    return await apiFetch<any[]>('/sponsors', {}, token);
  } catch {
    return null;
  }
}

export async function getAdminSponsorCampaigns(
  eventSlug?: string,
  token?: string
): Promise<any[] | null> {
  try {
    const query = eventSlug ? `?eventSlug=${encodeURIComponent(eventSlug)}` : '';
    return await apiFetch<any[]>(`/sponsors/campaigns${query}`, {}, token);
  } catch {
    return null;
  }
}

export async function getAdminSponsorPlacements(
  contestantSlug?: string,
  token?: string
): Promise<any[] | null> {
  try {
    const query = contestantSlug
      ? `?contestantSlug=${encodeURIComponent(contestantSlug)}`
      : '';
    return await apiFetch<any[]>(`/sponsors/campaigns${query}`, {}, token);
  } catch {
    return null;
  }
}

export async function getSponsorDashboardOverview(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/sponsor/overview', {}, token);
  } catch {
    return null;
  }
}

export async function getSponsorDiscoverContestants(
  options?: Record<string, string | number | boolean | string[] | undefined>,
  token?: string
): Promise<any[] | null> {
  try {
    const params = new URLSearchParams();
    Object.entries(options || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      }
    });
    const query = params.toString();
    return await apiFetch<any[]>(`/sponsor/discover${query ? `?${query}` : ''}`, {}, token);
  } catch {
    return null;
  }
}

export async function getSponsorProfileSettings(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/sponsor/settings', {}, token);
  } catch {
    return null;
  }
}

export async function saveSponsorProfileSettings(
  payload: any,
  token?: string
): Promise<any | null> {
  try {
    return await apiFetch<any>(
      '/sponsor/settings',
      { method: 'PATCH', body: JSON.stringify(payload) },
      token
    );
  } catch {
    return null;
  }
}

export async function getSponsorCampaignTracking(
  contestantSlug?: string,
  token?: string
): Promise<any[] | null> {
  try {
    const query = contestantSlug
      ? `?contestant=${encodeURIComponent(contestantSlug)}`
      : '';
    return await apiFetch<any[]>(`/sponsor/campaigns${query}`, {}, token);
  } catch {
    return null;
  }
}

export async function createSponsorCampaignRequest(
  payload: Record<string, unknown>,
  token?: string
): Promise<any | null> {
  try {
    return await apiFetch<any>(
      '/sponsor/campaigns',
      { method: 'POST', body: JSON.stringify(payload) },
      token
    );
  } catch {
    return null;
  }
}

export async function getSponsorAuditTrail(token?: string): Promise<any[] | null> {
  try {
    return await apiFetch<any[]>('/sponsor/audit', {}, token);
  } catch {
    return null;
  }
}

export async function getSponsorContestantDetail(
  contestantSlug: string,
  token?: string
): Promise<any | null> {
  try {
    return await apiFetch<any>(
      `/sponsor/contestants/${encodeURIComponent(contestantSlug)}`,
      {},
      token
    );
  } catch {
    return null;
  }
}

export async function trackSponsorImpression(payload: Record<string, unknown>) {
  try {
    await apiFetch<any>('/public/sponsor-impression', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
}

export async function trackSponsorClick(payload: Record<string, unknown>) {
  try {
    await apiFetch<any>('/public/sponsor-click', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return true;
  } catch {
    return false;
  }
}

export async function getMediaDashboard(token?: string): Promise<any | null> {
  try {
    const leaderboard = await apiFetch<any[]>('/media/leaderboard', {}, token);
    const rows = Array.isArray(leaderboard) ? leaderboard : [];
    const totalVotes = rows.reduce(
      (sum, row) => sum + Number(row?.totalVotes || row?.total_votes || 0),
      0
    );
    return {
      overview: {
        totalVotes,
        activeContestants: rows.length,
        votesToday: totalVotes,
        totalRevenue: 0,
        avgVotePrice: 0,
        totalTransactions: 0,
      },
      voteTrends: [],
      topContestants: rows.slice(0, 10).map((row, index) => {
        const transformed = transformLeaderboardEntry(row, index + 1);
        return {
          id: transformed.contestantId,
          name: transformed.contestantName,
          votes: transformed.totalVotes,
          rank: transformed.rank,
          category: transformed.categoryName || 'General',
          imageUrl: transformed.profileImageUrl,
        };
      }),
      paymentProviders: [],
      blockchainStatus: {},
    };
  } catch {
    return null;
  }
}

export async function getMediaGeographic(token?: string): Promise<any[] | null> {
  try {
    const leaderboard = await apiFetch<any[]>('/media/leaderboard', {}, token);
    const rows = Array.isArray(leaderboard) ? leaderboard : [];
    const buckets = new Map<string, { voteCount: number }>();

    rows.forEach((row) => {
      const country = String(row?.country || row?.country_name || 'Unknown');
      const votes = Number(row?.totalVotes || row?.total_votes || 0);
      const current = buckets.get(country) || { voteCount: 0 };
      current.voteCount += votes;
      buckets.set(country, current);
    });

    const totalVotes = Array.from(buckets.values()).reduce((sum, item) => sum + item.voteCount, 0) || 1;
    return Array.from(buckets.entries()).map(([country, item]) => ({
      country,
      voteCount: item.voteCount,
      percentage: (item.voteCount / totalVotes) * 100,
      uniqueDevices: item.voteCount,
      revenue: 0,
    }));
  } catch {
    return null;
  }
}

export async function getMediaFraud(token?: string): Promise<any | null> {
  try {
    return await apiFetch<any>('/media/fraud', {}, token);
  } catch {
    return null;
  }
}

export async function getMediaBlockchain(token?: string): Promise<any | null> {
  try {
    const activeEvent = await getActiveEvent();
    const eventId = Number(activeEvent?.id || 0);
    if (!eventId) return null;
    const summary = await apiFetch<any>(`/public/blockchain/summary/${eventId}`, {}, token);
    return {
      status: {
        networkStatus: summary?.network_status || summary?.networkStatus || 'Unknown',
        currentBlockHeight: Number(summary?.latest_block || summary?.currentBlockHeight || 0),
        totalAnchoredBatches: Number(summary?.anchored_batches || summary?.totalAnchoredBatches || 0),
        networkName: String(summary?.network_name || summary?.networkName || 'Unknown'),
        contractAddress: String(summary?.contract_address || summary?.contractAddress || ''),
      },
      recentBatches: Array.isArray(summary?.recent_batches) ? summary.recent_batches : [],
    };
  } catch {
    return null;
  }
}

export async function getMediaNotifications(token?: string): Promise<any[] | null> {
  try {
    const summary = await apiFetch<any>('/media/fraud/summary', {}, token);
    return [
      {
        id: 'fraud-summary',
        type: 'fraud',
        title: 'Fraud monitoring updated',
        description: `Pending alerts: ${Number(summary?.pendingAlerts || 0)}, high severity: ${Number(summary?.highSeverityAlerts || 0)}`,
        createdAt: new Date().toISOString(),
        read: false,
      },
    ];
  } catch {
    return null;
  }
}
