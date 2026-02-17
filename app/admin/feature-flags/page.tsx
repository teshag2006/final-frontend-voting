'use client';

import React, { useState, useEffect } from 'react';
import { featureFlagService, FeatureFlagKey } from '@/lib/services/featureFlagService';
import { ProtectedRouteWrapper } from '@/components/auth/protected-route-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ToggleLeft, ToggleRight, Edit2 } from 'lucide-react';

export default function FeatureFlagsPage() {
  return (
    <ProtectedRouteWrapper requiredRole="admin">
      <FeatureFlagsContent />
    </ProtectedRouteWrapper>
  );
}

function FeatureFlagsContent() {
  const [flags, setFlags] = useState(featureFlagService.getAllFlags());
  const [editingKey, setEditingKey] = useState<FeatureFlagKey | null>(null);
  const [rolloutPercentage, setRolloutPercentage] = useState(0);

  useEffect(() => {
    setFlags(featureFlagService.getAllFlags());
  }, []);

  const handleToggle = (key: FeatureFlagKey) => {
    const flag = flags[key];
    if (flag) {
      const updated = {
        ...flag,
        enabled: !flag.enabled,
        updatedAt: new Date().toISOString(),
      };
      featureFlagService.updateFlags({ [key]: updated });
      setFlags(featureFlagService.getAllFlags());
    }
  };

  const handleRolloutChange = (key: FeatureFlagKey, percentage: number) => {
    const flag = flags[key];
    if (flag) {
      const updated = {
        ...flag,
        rolloutPercentage: percentage,
        updatedAt: new Date().toISOString(),
      };
      featureFlagService.updateFlags({ [key]: updated });
      setFlags(featureFlagService.getAllFlags());
    }
  };

  const getEnablingStatus = (key: FeatureFlagKey) => {
    const flag = flags[key];
    if (!flag) return 'Unknown';
    if (!flag.enabled) return 'Disabled';
    if (flag.rolloutPercentage === 100) return 'Fully Enabled';
    return `Rolling out ${flag.rolloutPercentage}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feature Flags</h1>
        <p className="text-slate-400 mt-1">Control feature availability and rollout percentages</p>
      </div>

      <div className="grid gap-4">
        {Object.entries(flags).map(([key, flag]) => (
          <Card key={key} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold flex-1">{flag.key}</h3>
                    <button
                      onClick={() => handleToggle(flag.key as FeatureFlagKey)}
                      className="flex items-center gap-2 px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 transition"
                    >
                      {flag.enabled ? (
                        <>
                          <ToggleRight className="h-5 w-5 text-green-400" />
                          <span className="text-sm">Enabled</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5 text-slate-400" />
                          <span className="text-sm">Disabled</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-slate-300 text-sm mb-4">{flag.description}</p>

                  {flag.enabled && flag.rolloutPercentage < 100 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-slate-400">Rollout Percentage</label>
                        <span className="text-sm font-semibold text-blue-400">{flag.rolloutPercentage}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={flag.rolloutPercentage}
                        onChange={(e) =>
                          handleRolloutChange(
                            flag.key as FeatureFlagKey,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {flag.targetRoles && flag.targetRoles.length > 0 && (
                      <>
                        <span className="text-xs text-slate-400">Targets:</span>
                        {flag.targetRoles.map((role) => (
                          <span key={role} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-200">
                            {role}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium">
                  <div
                    className={`px-3 py-1 rounded ${
                      flag.enabled ? 'bg-green-950 text-green-300' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {getEnablingStatus(flag.key as FeatureFlagKey)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-950 border-blue-700">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-300">About Feature Flags</h4>
              <p className="text-sm text-blue-200 mt-1">
                Feature flags allow you to control feature availability without deploying new code. Use rollout percentages to gradually enable features and catch issues early. Changes take effect immediately for all users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
