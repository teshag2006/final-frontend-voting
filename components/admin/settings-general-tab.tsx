'use client';

import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { GeneralSettings } from '@/types/settings';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SettingsFormField } from './settings-form-field';
import { validateImageFile } from '@/lib/security/frontend-security';

interface SettingsGeneralTabProps {
  initialData: GeneralSettings;
  onSave: (data: GeneralSettings) => Promise<void>;
  isLoading?: boolean;
}

export function SettingsGeneralTab({ initialData, onSave, isLoading }: SettingsGeneralTabProps) {
  const [formData, setFormData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [assetError, setAssetError] = useState('');

  useEffect(() => {
    setFormData(initialData);
    setIsDirty(false);
  }, [initialData]);

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

  const toDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Invalid file payload'));
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });

  const handleLogoUpload = async (file?: File) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setAssetError(validation.error || 'Invalid logo file.');
      return;
    }
    try {
      const dataUrl = await toDataUrl(file);
      setFormData((prev) => ({ ...prev, logoUrl: dataUrl }));
      setAssetError('');
      setIsDirty(true);
    } catch {
      setAssetError('Could not process logo file.');
    }
  };

  const handleFaviconUpload = async (file?: File) => {
    if (!file) return;
    const allowed = ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setAssetError('Favicon must be PNG, ICO, or SVG.');
      return;
    }
    const maxBytes = 1024 * 1024;
    if (file.size > maxBytes) {
      setAssetError('Favicon must be 1MB or less.');
      return;
    }
    try {
      const dataUrl = await toDataUrl(file);
      setFormData((prev) => ({ ...prev, faviconUrl: dataUrl }));
      setAssetError('');
      setIsDirty(true);
    } catch {
      setAssetError('Could not process favicon file.');
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

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Branding Assets</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-600">Logo Upload</p>
                <div className="mt-2 flex items-center gap-3">
                  {formData.logoUrl ? (
                    <div className="relative">
                      <img src={formData.logoUrl} alt="Logo preview" className="h-14 w-14 rounded-md border border-slate-200 object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, logoUrl: '' }));
                          setIsDirty(true);
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white"
                        aria-label="Remove logo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white text-[10px] text-slate-500">
                      No logo
                    </div>
                  )}
                  <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-100">
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Upload
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => void handleLogoUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-600">Favicon Upload</p>
                <div className="mt-2 flex items-center gap-3">
                  {formData.faviconUrl ? (
                    <div className="relative">
                      <img src={formData.faviconUrl} alt="Favicon preview" className="h-14 w-14 rounded-md border border-slate-200 object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, faviconUrl: '' }));
                          setIsDirty(true);
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white"
                        aria-label="Remove favicon"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white text-[10px] text-slate-500">
                      No icon
                    </div>
                  )}
                  <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-100">
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Upload
                    <input
                      type="file"
                      accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
                      className="hidden"
                      onChange={(e) => void handleFaviconUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>
            </div>
            {assetError ? <p className="mt-2 text-xs text-red-600">{assetError}</p> : null}
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
