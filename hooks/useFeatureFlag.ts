'use client';

import { useState, useEffect } from 'react';
import { featureFlagService, FeatureFlagKey } from '@/lib/services/featureFlagService';
import { useAuth } from '@/context/AuthContext';

export function useFeatureFlag(flag: FeatureFlagKey) {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const enabled = featureFlagService.isEnabled(flag, user?.role, user?.id);
      setIsEnabled(enabled);
    } catch (error) {
      console.error(`[v0] Error checking feature flag ${flag}:`, error);
      setIsEnabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [flag, user?.role, user?.id]);

  return { isEnabled, isLoading };
}
