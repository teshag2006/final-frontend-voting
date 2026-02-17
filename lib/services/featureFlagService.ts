'use server';

export type FeatureFlagKey = 
  | 'blockchain_anchor'
  | 'otp_requirement'
  | 'free_vote_policy'
  | 'auto_leaderboard_refresh'
  | 'maintenance_mode'
  | 'fraud_auto_suspension'
  | 'payment_reconciliation'
  | 'announcement_system'
  | 'analytics_tracking'
  | 'emergency_controls';

export interface FeatureFlag {
  key: FeatureFlagKey;
  enabled: boolean;
  description: string;
  rolloutPercentage: number; // 0-100 for gradual rollout
  targetRoles?: Array<'admin' | 'contestant' | 'media' | 'voter'>;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagConfig {
  [key in FeatureFlagKey]: FeatureFlag;
}

// Default feature flags - will be overridden by backend
const defaultFlags: FeatureFlagConfig = {
  blockchain_anchor: {
    key: 'blockchain_anchor',
    enabled: false,
    description: 'Enable blockchain anchor for vote immutability',
    rolloutPercentage: 0,
    targetRoles: ['admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  otp_requirement: {
    key: 'otp_requirement',
    enabled: false,
    description: 'Require OTP for all login attempts',
    rolloutPercentage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  free_vote_policy: {
    key: 'free_vote_policy',
    enabled: false,
    description: 'Allow free votes without payment',
    rolloutPercentage: 0,
    targetRoles: ['voter'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  auto_leaderboard_refresh: {
    key: 'auto_leaderboard_refresh',
    enabled: true,
    description: 'Auto-refresh leaderboard in real-time',
    rolloutPercentage: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  maintenance_mode: {
    key: 'maintenance_mode',
    enabled: false,
    description: 'Enable maintenance mode (blocks all non-admin access)',
    rolloutPercentage: 0,
    targetRoles: ['admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  fraud_auto_suspension: {
    key: 'fraud_auto_suspension',
    enabled: false,
    description: 'Auto-suspend accounts with high fraud scores',
    rolloutPercentage: 0,
    targetRoles: ['admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  payment_reconciliation: {
    key: 'payment_reconciliation',
    enabled: false,
    description: 'Enable daily payment reconciliation jobs',
    rolloutPercentage: 0,
    targetRoles: ['admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  announcement_system: {
    key: 'announcement_system',
    enabled: true,
    description: 'Enable admin announcements and banners',
    rolloutPercentage: 100,
    targetRoles: ['admin', 'contestant', 'media', 'voter'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  analytics_tracking: {
    key: 'analytics_tracking',
    enabled: true,
    description: 'Track user analytics events',
    rolloutPercentage: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  emergency_controls: {
    key: 'emergency_controls',
    enabled: true,
    description: 'Enable emergency controls dashboard for admins',
    rolloutPercentage: 100,
    targetRoles: ['admin'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// In-memory cache for feature flags
let flagCache: FeatureFlagConfig = defaultFlags;
let cacheTimestamp = Date.now();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class FeatureFlagService {
  private cache: FeatureFlagConfig = defaultFlags;
  private cacheTime = Date.now();

  /**
   * Check if a feature flag is enabled for the user
   */
  isEnabled(
    key: FeatureFlagKey,
    userRole?: string,
    userId?: string
  ): boolean {
    const flag = this.getFlag(key);
    if (!flag || !flag.enabled) return false;

    // Check role targeting
    if (flag.targetRoles && userRole) {
      if (!flag.targetRoles.includes(userRole as any)) {
        return false;
      }
    }

    // Check rollout percentage (simple hash-based)
    if (flag.rolloutPercentage < 100) {
      if (userId) {
        const hash = this.simpleHash(userId + key);
        return (hash % 100) < flag.rolloutPercentage;
      }
    }

    return true;
  }

  /**
   * Get a specific feature flag
   */
  getFlag(key: FeatureFlagKey): FeatureFlag | null {
    this.refreshCacheIfNeeded();
    return this.cache[key] || null;
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlagConfig {
    this.refreshCacheIfNeeded();
    return { ...this.cache };
  }

  /**
   * Get flags for a specific role
   */
  getFlagsForRole(role: string): FeatureFlagConfig {
    const result: FeatureFlagConfig = {} as FeatureFlagConfig;
    const allFlags = this.getAllFlags();

    Object.entries(allFlags).forEach(([key, flag]) => {
      if (!flag.targetRoles || flag.targetRoles.includes(role as any)) {
        result[key as FeatureFlagKey] = flag;
      }
    });

    return result;
  }

  /**
   * Update feature flags (called from backend)
   */
  updateFlags(newFlags: Partial<FeatureFlagConfig>): void {
    this.cache = { ...this.cache, ...newFlags };
    this.cacheTime = Date.now();
  }

  /**
   * Refresh cache from backend if needed
   */
  private refreshCacheIfNeeded(): void {
    const now = Date.now();
    if (now - this.cacheTime > CACHE_TTL) {
      // In production, fetch from backend API
      // For now, use default flags
      this.cache = { ...defaultFlags };
      this.cacheTime = now;
    }
  }

  /**
   * Simple hash function for rollout percentage
   */
  private simpleHash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

export const featureFlagService = new FeatureFlagService();
