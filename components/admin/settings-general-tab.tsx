'use client';

import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { GeneralSettings } from '@/types/settings';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SettingsFormField } from './settings-form-field';
import { validateImageFile } from '@/lib/security/frontend-security';
import { uploadMediaFile } from '@/lib/client/upload-media';

interface SettingsGeneralTabProps {
  initialData: GeneralSettings;
  onSave: (data: GeneralSettings) => Promise<void>;
  isLoading?: boolean;
}

export function SettingsGeneralTab({ initialData, onSave, isLoading }: SettingsGeneralTabProps) {
  const [formData, setFormData] = useState(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
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

  const handleLogoUpload = async (file?: File) => {
    if (!file) return;
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setAssetError(validation.error || 'Invalid logo file.');
      return;
    }
    try {
      setIsUploadingLogo(true);
      const uploadedUrl = await uploadMediaFile(file, 'admin-assets/logo');
      setFormData((prev) => ({ ...prev, logoUrl: uploadedUrl }));
      setAssetError('');
      setIsDirty(true);
    } catch (error) {
      setAssetError(error instanceof Error ? error.message : 'Could not process logo file.');
    } finally {
      setIsUploadingLogo(false);
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
      setIsUploadingFavicon(true);
      const uploadedUrl = await uploadMediaFile(file, 'admin-assets/favicon');
      setFormData((prev) => ({ ...prev, faviconUrl: uploadedUrl }));
      setAssetError('');
      setIsDirty(true);
    } catch (error) {
      setAssetError(error instanceof Error ? error.message : 'Could not process favicon file.');
    } finally {
      setIsUploadingFavicon(false);
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

          <SettingsFormField label="Site Title" required>
            <Input
              value={formData.siteTitle || ''}
              onChange={(e) => handleChange('siteTitle', e.target.value)}
              placeholder="Enter default site title"
            />
          </SettingsFormField>

          <SettingsFormField label="Meta Description">
            <textarea
              value={formData.metaDescription || ''}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              placeholder="Enter default SEO meta description"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </SettingsFormField>

          <SettingsFormField label="Meta Keywords">
            <Input
              value={formData.metaKeywords || ''}
              onChange={(e) => handleChange('metaKeywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
          </SettingsFormField>

          <SettingsFormField label="Canonical Base URL">
            <Input
              type="url"
              value={formData.canonicalBaseUrl || ''}
              onChange={(e) => handleChange('canonicalBaseUrl', e.target.value)}
              placeholder="https://yourdomain.com"
            />
          </SettingsFormField>

          <SettingsFormField label="Default Open Graph Image URL">
            <Input
              type="url"
              value={formData.defaultOgImageUrl || ''}
              onChange={(e) => handleChange('defaultOgImageUrl', e.target.value)}
              placeholder="https://yourdomain.com/og-image.jpg"
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
                <p className="mt-1 text-[11px] text-slate-500">Recommended: 512x512 px square (PNG with transparent background preferred).</p>
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
                      disabled={isUploadingLogo}
                      onChange={(e) => void handleLogoUpload(e.target.files?.[0])}
                    />
                  </label>
                  {isUploadingLogo ? <span className="text-xs text-slate-500">Uploading...</span> : null}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-600">Favicon Upload</p>
                <p className="mt-1 text-[11px] text-slate-500">Recommended: 64x64 px square (ICO or PNG).</p>
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
                      disabled={isUploadingFavicon}
                      onChange={(e) => void handleFaviconUpload(e.target.files?.[0])}
                    />
                  </label>
                  {isUploadingFavicon ? <span className="text-xs text-slate-500">Uploading...</span> : null}
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
