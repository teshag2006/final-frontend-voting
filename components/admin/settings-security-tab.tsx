'use client';

import { useState } from 'react';
import { SecuritySettings } from '@/types/settings';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsFormField } from './settings-form-field';
import { AlertCircle } from 'lucide-react';

interface SettingsSecurityTabProps {
  initialData: SecuritySettings;
  onSave: (data: SecuritySettings) => Promise<void>;
  isLoading?: boolean;
}

export function SettingsSecurityTab({ initialData, onSave, isLoading }: SettingsSecurityTabProps) {
  const [formData, setFormData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showReAuthModal, setShowReAuthModal] = useState(false);

  const handleChange = (field: keyof SecuritySettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    // Show re-auth modal for high-risk changes
    setShowReAuthModal(true);
  };

  const confirmSave = async (password: string) => {
    setIsSaving(true);
    try {
      await onSave(formData);
      setIsDirty(false);
      setShowReAuthModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Risk Warning */}
      <Card className="border-amber-200 bg-amber-50 p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900">
            Security settings are high-risk changes. Modifications will require re-authentication and will be logged.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-6">Security Configuration</h3>
        <div className="space-y-4">
          <SettingsFormField label="JWT Expiration (seconds)" description="How long JWT tokens remain valid">
            <Input
              type="number"
              value={formData.jwtExpirationTime}
              onChange={(e) => handleChange('jwtExpirationTime', parseInt(e.target.value))}
              min="300"
              max="86400"
            />
          </SettingsFormField>

          <SettingsFormField
            label="Refresh Token Expiration (seconds)"
            description="How long refresh tokens remain valid"
          >
            <Input
              type="number"
              value={formData.refreshTokenExpiration}
              onChange={(e) => handleChange('refreshTokenExpiration', parseInt(e.target.value))}
              min="3600"
            />
          </SettingsFormField>

          <SettingsFormField label="Password Strength Policy">
            <select
              value={formData.passwordStrengthPolicy}
              onChange={(e) => handleChange('passwordStrengthPolicy', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </SettingsFormField>

          <SettingsFormField label="Max Login Attempts">
            <Input
              type="number"
              value={formData.maxLoginAttempts}
              onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
              min="1"
              max="10"
            />
          </SettingsFormField>

          <SettingsFormField label="Rate Limit Per IP (req/min)">
            <Input
              type="number"
              value={formData.rateLimitPerIP}
              onChange={(e) => handleChange('rateLimitPerIP', parseInt(e.target.value))}
              min="10"
            />
          </SettingsFormField>

          <div className="pt-4 border-t">
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enable2FA}
                onChange={(e) => handleChange('enable2FA', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="font-medium text-slate-900">Enable 2FA</span>
            </Label>
          </div>

          <div>
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableIPWhitelisting}
                onChange={(e) => handleChange('enableIPWhitelisting', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="font-medium text-slate-900">Enable IP Whitelisting</span>
            </Label>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setFormData(initialData);
            setIsDirty(false);
          }}
          disabled={!isDirty || isSaving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!isDirty || isSaving} className="gap-2">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
