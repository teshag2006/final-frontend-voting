'use client';

import { useState } from 'react';
import { GeneralSettings } from '@/types/settings';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SettingsFormField } from './settings-form-field';

interface SettingsGeneralTabProps {
  initialData: GeneralSettings;
  onSave: (data: GeneralSettings) => Promise<void>;
  isLoading?: boolean;
}

export function SettingsGeneralTab({ initialData, onSave, isLoading }: SettingsGeneralTabProps) {
  const [formData, setFormData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof GeneralSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-6">General Configuration</h3>
        <div className="space-y-4">
          <SettingsFormField label="System Name" required>
            <Input
              value={formData.systemName}
              onChange={(e) => handleChange('systemName', e.target.value)}
              placeholder="Enter system name"
            />
          </SettingsFormField>

          <SettingsFormField label="Default Language" required>
            <select
              value={formData.defaultLanguage}
              onChange={(e) => handleChange('defaultLanguage', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </SettingsFormField>

          <SettingsFormField label="Timezone" required>
            <select
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
              <option value="GMT">GMT</option>
            </select>
          </SettingsFormField>

          <SettingsFormField label="Currency" required>
            <Input
              value={formData.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              placeholder="USD"
            />
          </SettingsFormField>

          <SettingsFormField label="Support Email" required>
            <Input
              type="email"
              value={formData.supportEmail}
              onChange={(e) => handleChange('supportEmail', e.target.value)}
              placeholder="support@example.com"
            />
          </SettingsFormField>

          <SettingsFormField label="Terms & Conditions URL" required>
            <Input
              type="url"
              value={formData.termsConditionsUrl}
              onChange={(e) => handleChange('termsConditionsUrl', e.target.value)}
              placeholder="https://example.com/terms"
            />
          </SettingsFormField>
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
