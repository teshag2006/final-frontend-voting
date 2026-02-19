import type { Event, EventSummary, EventStats, LeaderboardEntry, FAQItem } from "@/types/event";
import type { Category, CategorySummary, CategoryContestant, CategoryContestantsResponse } from "@/types/category";
import type { Contestant, ContestantProfile, ContestantStats, VotePackage, GeographicSupport } from "@/types/contestant";
import type { PublicContestantsResponse, PublicCategory } from "@/types/public-contestant";
import type {
  DashboardOverviewData,
  RankingData,
  DailyVote,
  VoteDistributionByHour,
  FraudDetectionMetrics,
  RevenueMetrics,
  RevenueSnapshot,
  PaymentMethodBreakdown,
  TrustSecurityMetrics,
  FraudAlert,
  GeographicData,
  VPNProxyActivity,
  SponsorVisibility,
  EventDetails,
  Notification,
} from "@/types/dashboard";
import type { Sponsor } from "@/types/contestant";
import type {
  MarketplaceContestant,
  SponsorCampaignTracking,
  SponsorDashboardOverview,
  SponsorProfileSettings,
} from "@/lib/sponsorship-mock";
import type {
  VoterPayment,
  VoterVote,
  VoterProfile,
  VoterPaymentsResponse,
  VoterVotesResponse,
} from "@/types/voter";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function getActiveEvent(): Promise<Event | null> {
  try {
    return await fetchFromAPI<Event>("/public/active-event");
  } catch {
    return null;
  }
}

export async function getEventSummary(
  eventId: string
): Promise<EventSummary | null> {
  try {
    return await fetchFromAPI<EventSummary>(
      `/public/event-summary/${eventId}`
    );
  } catch {
    return null;
  }
}

export async function getCategories(
  eventId: string
): Promise<Category[]> {
  try {
    return await fetchFromAPI<Category[]>(
      `/public/categories/${eventId}`
    );
  } catch {
    return [];
  }
}

export async function getFeaturedContestants(
  eventId: string
): Promise<Contestant[]> {
  try {
    return await fetchFromAPI<Contestant[]>(
      `/public/featured-contestants/${eventId}`
    );
  } catch {
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    return await fetchFromAPI<Event>(`/public/event/${slug}`);
  } catch {
    return null;
  }
}

export async function getEventStats(slug: string): Promise<EventStats | null> {
  try {
    return await fetchFromAPI<EventStats>(`/public/event/${slug}/stats`);
  } catch {
    return null;
  }
}

export async function getEventCategories(slug: string): Promise<Category[]> {
  try {
    return await fetchFromAPI<Category[]>(`/public/event/${slug}/categories`);
  } catch {
    return [];
  }
}

export async function getEventContestants(slug: string): Promise<Contestant[]> {
  try {
    return await fetchFromAPI<Contestant[]>(`/public/event/${slug}/contestants`);
  } catch {
    return [];
  }
}

export async function getEventLeaderboard(
  slug: string,
  limit = 5
): Promise<LeaderboardEntry[]> {
  try {
    return await fetchFromAPI<LeaderboardEntry[]>(
      `/public/event/${slug}/leaderboard?limit=${limit}`
    );
  } catch {
    return [];
  }
}

export async function getEventFAQ(slug: string): Promise<FAQItem[]> {
  try {
    return await fetchFromAPI<FAQItem[]>(`/public/event/${slug}/faq`);
  } catch {
    return [];
  }
}

export async function getContestantProfile(
  eventSlug: string,
  contestantSlug: string
): Promise<ContestantProfile | null> {
  try {
    return await fetchFromAPI<ContestantProfile>(
      `/public/event/${eventSlug}/contestant/${contestantSlug}`
    );
  } catch {
    return null;
  }
}

export async function getContestantStats(
  eventSlug: string,
  contestantSlug: string
): Promise<ContestantStats | null> {
  try {
    return await fetchFromAPI<ContestantStats>(
      `/public/event/${eventSlug}/contestant/${contestantSlug}/stats`
    );
  } catch {
    return null;
  }
}

export async function getVotePackages(eventSlug: string): Promise<VotePackage[]> {
  try {
    return await fetchFromAPI<VotePackage[]>(
      `/public/event/${eventSlug}/vote-packages`
    );
  } catch {
    return [];
  }
}

export async function getGeographicSupport(
  eventSlug: string,
  contestantSlug: string
): Promise<GeographicSupport | null> {
  try {
    return await fetchFromAPI<GeographicSupport>(
      `/public/event/${eventSlug}/contestant/${contestantSlug}/geographic-support`
    );
  } catch {
    return null;
  }
}

export async function getRelatedContestants(
  eventSlug: string,
  contestantSlug: string
): Promise<Contestant[]> {
  try {
    return await fetchFromAPI<Contestant[]>(
      `/public/event/${eventSlug}/contestant/${contestantSlug}/related`
    );
  } catch {
    return [];
  }
}

export async function getCategory(
  categoryId: string
): Promise<Category | null> {
  try {
    return await fetchFromAPI<Category>(`/public/category/${categoryId}`);
  } catch {
    return null;
  }
}

export async function getCategorySummary(
  categoryId: string
): Promise<CategorySummary | null> {
  try {
    return await fetchFromAPI<CategorySummary>(
      `/public/category/${categoryId}/summary`
    );
  } catch {
    return null;
  }
}

export async function getCategoryContestants(
  categoryId: string,
  options?: {
    page?: number;
    limit?: number;
    sort?: "total_votes" | "created_at" | "full_name";
    country?: string;
  }
): Promise<CategoryContestantsResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", String(options.page));
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.sort) params.append("sort", options.sort);
    if (options?.country) params.append("country", options.country);

    const queryString = params.toString();
    const endpoint = `/public/category/${categoryId}/contestants${
      queryString ? `?${queryString}` : ""
    }`;

    return await fetchFromAPI<CategoryContestantsResponse>(endpoint);
  } catch {
    return {
      data: [],
      meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  }
}

export async function getPublicCategoryInfo(
  categoryId: string
): Promise<PublicCategory | null> {
  try {
    return await fetchFromAPI<PublicCategory>(`/public/category-info/${categoryId}`);
  } catch {
    return null;
  }
}

export async function getPublicCategoryContestants(
  categoryId: string,
  options?: {
    page?: number;
    limit?: number;
    sort?: "total_votes" | "alphabetical" | "recent";
    country?: string;
  }
): Promise<PublicContestantsResponse> {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", String(options.page));
    if (options?.limit) params.append("limit", String(options.limit));
    if (options?.sort) params.append("sort", options.sort);
    if (options?.country) params.append("country", options.country);

    const queryString = params.toString();
    const endpoint = `/public/category-contestants/${categoryId}${
      queryString ? `?${queryString}` : ""
    }`;

    return await fetchFromAPI<PublicContestantsResponse>(endpoint);
  } catch {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      total_pages: 0,
    };
  }
}

// Dashboard API functions
export async function getDashboardOverview(): Promise<DashboardOverviewData | null> {
  try {
    return await fetchFromAPI<DashboardOverviewData>(
      "/contestant/dashboard/overview"
    );
  } catch {
    return null;
  }
}

export async function getRankingData(): Promise<RankingData | null> {
  try {
    return await fetchFromAPI<RankingData>("/contestant/ranking");
  } catch {
    return null;
  }
}

export async function getAnalyticsData(): Promise<{
  daily_votes: DailyVote[];
  hourly_distribution: VoteDistributionByHour[];
  fraud_metrics: FraudDetectionMetrics;
} | null> {
  try {
    return await fetchFromAPI("/contestant/analytics");
  } catch {
    return null;
  }
}

export async function getRevenueData(): Promise<{
  metrics: RevenueMetrics;
  snapshots: RevenueSnapshot[];
  payment_methods: PaymentMethodBreakdown;
} | null> {
  try {
    return await fetchFromAPI("/contestant/revenue");
  } catch {
    return null;
  }
}

export async function getSecurityData(): Promise<{
  metrics: TrustSecurityMetrics;
  alerts: FraudAlert[];
} | null> {
  try {
    return await fetchFromAPI("/contestant/security");
  } catch {
    return null;
  }
}

export async function getGeographicData(): Promise<{
  countries: GeographicData[];
  vpn_activity: VPNProxyActivity;
} | null> {
  try {
    return await fetchFromAPI("/contestant/geographic");
  } catch {
    return null;
  }
}

export async function getSponsorsData(): Promise<SponsorVisibility[] | null> {
  try {
    return await fetchFromAPI<SponsorVisibility[]>("/contestant/sponsors");
  } catch {
    return null;
  }
}

export async function getAdminSponsors(): Promise<Sponsor[] | null> {
  try {
    return await fetchFromAPI<Sponsor[]>("/admin/sponsors");
  } catch {
    return null;
  }
}

export async function getAdminSponsorCampaigns(eventSlug?: string): Promise<any[] | null> {
  try {
    const query = eventSlug ? `?eventSlug=${encodeURIComponent(eventSlug)}` : "";
    return await fetchFromAPI<any[]>(`/admin/sponsor-campaigns${query}`);
  } catch {
    return null;
  }
}

export async function getAdminSponsorPlacements(contestantSlug?: string): Promise<any[] | null> {
  try {
    const query = contestantSlug ? `?contestantSlug=${encodeURIComponent(contestantSlug)}` : "";
    return await fetchFromAPI<any[]>(`/admin/sponsor-placements${query}`);
  } catch {
    return null;
  }
}

export async function getSponsorDashboardOverview(): Promise<SponsorDashboardOverview | null> {
  try {
    return await fetchFromAPI<SponsorDashboardOverview>("/sponsor/overview");
  } catch {
    return null;
  }
}

export async function getSponsorDiscoverContestants(options?: {
  query?: string;
  tier?: "ALL" | "A" | "B" | "C";
  trendingOnly?: boolean;
  highIntegrityOnly?: boolean;
  votesMin?: number;
  followersMin?: number;
  engagementMin?: number;
  industryCategory?: string;
}): Promise<MarketplaceContestant[] | null> {
  try {
    const params = new URLSearchParams();
    if (options?.query) params.set("query", options.query);
    if (options?.tier) params.set("tier", options.tier);
    if (typeof options?.trendingOnly === "boolean") params.set("trendingOnly", String(options.trendingOnly));
    if (typeof options?.highIntegrityOnly === "boolean") params.set("highIntegrityOnly", String(options.highIntegrityOnly));
    if (typeof options?.votesMin === "number" && options.votesMin > 0) params.set("votesMin", String(options.votesMin));
    if (typeof options?.followersMin === "number" && options.followersMin > 0) params.set("followersMin", String(options.followersMin));
    if (typeof options?.engagementMin === "number" && options.engagementMin > 0) params.set("engagementMin", String(options.engagementMin));
    if (options?.industryCategory) params.set("industryCategory", options.industryCategory);

    const query = params.toString();
    return await fetchFromAPI<MarketplaceContestant[]>(`/sponsor/discover${query ? `?${query}` : ""}`);
  } catch {
    return null;
  }
}

export async function getSponsorProfileSettings(): Promise<SponsorProfileSettings | null> {
  try {
    return await fetchFromAPI<SponsorProfileSettings>("/sponsor/settings");
  } catch {
    return null;
  }
}

export async function getSponsorCampaignTracking(contestantSlug?: string): Promise<SponsorCampaignTracking[] | null> {
  try {
    const query = contestantSlug ? `?contestant=${encodeURIComponent(contestantSlug)}` : "";
    return await fetchFromAPI<SponsorCampaignTracking[]>(`/sponsor/campaigns${query}`);
  } catch {
    return null;
  }
}

export async function getSponsorContestantDetail(contestantSlug: string): Promise<MarketplaceContestant | null> {
  try {
    return await fetchFromAPI<MarketplaceContestant>(`/sponsor/contestants/${encodeURIComponent(contestantSlug)}`);
  } catch {
    return null;
  }
}

export async function getEventSponsorsPublic(eventSlug: string): Promise<Sponsor[] | null> {
  try {
    return await fetchFromAPI<Sponsor[]>(`/public/event/${eventSlug}/sponsors`);
  } catch {
    return null;
  }
}

export async function getContestantSponsorsPublic(
  eventSlug: string,
  contestantSlug: string
): Promise<Sponsor[] | null> {
  try {
    return await fetchFromAPI<Sponsor[]>(
      `/public/event/${eventSlug}/contestant/${contestantSlug}/sponsors`
    );
  } catch {
    return null;
  }
}

export async function trackSponsorImpression(payload: {
  sponsorId: string;
  placementId?: string;
  sourcePage: string;
  eventSlug?: string;
  contestantSlug?: string;
}): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/sponsor-impression`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function trackSponsorClick(payload: {
  sponsorId: string;
  placementId?: string;
  sourcePage: string;
  eventSlug?: string;
  contestantSlug?: string;
  targetUrl?: string;
}): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/sponsor-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getEventDetails(): Promise<EventDetails | null> {
  try {
    return await fetchFromAPI<EventDetails>("/contestant/event");
  } catch {
    return null;
  }
}

export async function getNotifications(): Promise<Notification[] | null> {
  try {
    return await fetchFromAPI<Notification[]>("/contestant/notifications");
  } catch {
    return null;
  }
}

// Voter API functions
export async function getVoterPayments(): Promise<VoterPaymentsResponse | null> {
  try {
    return await fetchFromAPI<VoterPaymentsResponse>("/voter/payments");
  } catch {
    return null;
  }
}

export async function getVoterVotes(): Promise<VoterVotesResponse | null> {
  try {
    return await fetchFromAPI<VoterVotesResponse>("/voter/my-votes");
  } catch {
    return null;
  }
}

export async function getVoterProfile(): Promise<VoterProfile | null> {
  try {
    return await fetchFromAPI<VoterProfile>("/voter/profile");
  } catch {
    return null;
  }
}

export async function updateVoterProfile(
  fullName: string
): Promise<VoterProfile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/voter/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName }),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function triggerPhoneVerification(): Promise<{ success: boolean } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/voter/verify-phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function deleteVoterAccount(): Promise<{ success: boolean } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/voter/account`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
