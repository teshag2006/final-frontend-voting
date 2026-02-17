import type { Category, CategorySummary, CategoryContestant, CategoryContestantsResponse } from "@/types/category";

/**
 * Mock data for development and testing
 * Replace API calls with this data when API is not available
 */

export const mockCategory: Category = {
  id: "cat-001",
  slug: "miss-africa",
  name: "Miss Africa",
  event_id: "event-001",
  event_name: "Miss & Mr Africa 2025",
  is_active: true,
  contestant_count: 45,
  description: "The most prestigious pageant celebrating African beauty and talent. Vote for your favorite Miss Africa contestant.",
  image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop",
  created_at: "2025-01-01T00:00:00Z",
};

export const mockCategorySummary: CategorySummary = {
  total_votes: 1245330,
  active_countries: 42,
  blockchain_anchored_count: 312,
  closing_time: "2025-12-31T23:59:59Z",
};

export const mockContestants: CategoryContestant[] = [
  {
    id: "contestant-001",
    full_name: "Sarah M",
    country: "Nigeria",
    profile_image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
    is_verified: true,
    category_id: "cat-001",
    total_votes: 57000,
    valid_votes: 55000,
    pending_votes: 2000,
    rank: 1,
  },
  {
    id: "contestant-002",
    full_name: "Amara K",
    country: "Kenya",
    profile_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    is_verified: true,
    category_id: "cat-001",
    total_votes: 52000,
    valid_votes: 50500,
    pending_votes: 1500,
    rank: 2,
  },
  {
    id: "contestant-003",
    full_name: "Zainab A",
    country: "Egypt",
    profile_image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    is_verified: false,
    category_id: "cat-001",
    total_votes: 48500,
    valid_votes: 47000,
    pending_votes: 1500,
    rank: 3,
  },
  {
    id: "contestant-004",
    full_name: "Nandi M",
    country: "South Africa",
    profile_image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop",
    is_verified: true,
    category_id: "cat-001",
    total_votes: 45200,
    valid_votes: 43800,
    pending_votes: 1400,
    rank: 4,
  },
  {
    id: "contestant-005",
    full_name: "Chioma E",
    country: "Nigeria",
    profile_image_url: "https://images.unsplash.com/photo-1517411174588-c4a88f803161?w=400&h=600&fit=crop",
    is_verified: true,
    category_id: "cat-001",
    total_votes: 42800,
    valid_votes: 41200,
    pending_votes: 1600,
    rank: 5,
  },
  {
    id: "contestant-006",
    full_name: "Fatima B",
    country: "Morocco",
    profile_image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop",
    is_verified: false,
    category_id: "cat-001",
    total_votes: 39500,
    valid_votes: 38000,
    pending_votes: 1500,
    rank: 6,
  },
  {
    id: "contestant-007",
    full_name: "Asha P",
    country: "Tanzania",
    profile_image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
    is_verified: true,
    category_id: "cat-001",
    total_votes: 36200,
    valid_votes: 34800,
    pending_votes: 1400,
    rank: 7,
  },
  {
    id: "contestant-008",
    full_name: "Grace O",
    country: "Uganda",
    profile_image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop",
    is_verified: true,
    category_id: "cat-001",
    total_votes: 33900,
    valid_votes: 32500,
    pending_votes: 1400,
    rank: 8,
  },
];

export const mockContestantsResponse: CategoryContestantsResponse = {
  data: mockContestants,
  meta: {
    total: 45,
    page: 1,
    limit: 20,
    totalPages: 3,
  },
};

/**
 * Helper to get mock data with pagination
 */
export function getMockContestants(
  page: number = 1,
  limit: number = 20,
  sort: "total_votes" | "created_at" | "full_name" = "total_votes",
  country?: string
): CategoryContestantsResponse {
  let filtered = [...mockContestants];

  // Filter by country if provided
  if (country) {
    filtered = filtered.filter(c => c.country.toLowerCase() === country.toLowerCase());
  }

  // Sort
  if (sort === "total_votes") {
    filtered.sort((a, b) => b.total_votes - a.total_votes);
  } else if (sort === "created_at") {
    // Reverse order (newest first)
    filtered.reverse();
  } else if (sort === "full_name") {
    filtered.sort((a, b) => a.full_name.localeCompare(b.full_name));
  }

  // Paginate
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filtered.slice(start, end);

  return {
    data: paginatedData,
    meta: {
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

/**
 * Get unique countries from mock data
 */
export function getMockCountries(): string[] {
  const countries = [...new Set(mockContestants.map(c => c.country))];
  return countries.sort();
}

/**
 * Mock category by ID (supports multiple categories)
 */
export function getMockCategoryById(categoryId: string): Category | null {
  // In a real app, would query database
  // For now, return same category for any ID
  if (categoryId === "cat-001" || categoryId === "cat-miss") {
    return mockCategory;
  }
  return null;
}
