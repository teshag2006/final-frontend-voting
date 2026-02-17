'use client';

import { useState } from 'react';
import { Save, Upload, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TenantConfig {
  brandName: string;
  logo?: string;
  brandColor: string;
  domain?: string;
  pricingTiers: Array<{ name: string; votes: number; price: number }>;
  scoringWeights: { presentation: number; talent: number; answers: number };
}

interface SaaSTenantConfigProps {
  config?: TenantConfig;
  onSave?: (config: TenantConfig) => Promise<void>;
  isSaving?: boolean;
}

export function SaaSTenantConfig({ config, onSave, isSaving = false }: SaaSTenantConfigProps) {
  const [formData, setFormData] = useState<TenantConfig>(
    config || {
      brandName: '',
      logo: '',
      brandColor: '#1a1f4e',
      domain: '',
      pricingTiers: [
        { name: 'Basic', votes: 10, price: 1.99 },
        { name: 'Plus', votes: 50, price: 7.99 },
        { name: 'Premium', votes: 200, price: 19.99 },
      ],
      scoringWeights: { presentation: 0.3, talent: 0.4, answers: 0.3 },
    }
  );

  const [savedIndicator, setSavedIndicator] = useState(false);

  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, brandName: e.target.value });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, brandColor: e.target.value });
  };

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, domain: e.target.value });
  };

  const handleWeightChange = (key: 'presentation' | 'talent' | 'answers', value: number) => {
    setFormData({
      ...formData,
      scoringWeights: { ...formData.scoringWeights, [key]: value },
    });
  };

  const handlePricingChange = (index: number, field: 'name' | 'votes' | 'price', value: string | number) => {
    const newTiers = [...formData.pricingTiers];
    if (field === 'votes' || field === 'price') {
      newTiers[index][field] = typeof value === 'string' ? parseInt(value) : value;
    } else {
      newTiers[index][field] = value as string;
    }
    setFormData({ ...formData, pricingTiers: newTiers });
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(formData);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Tenant Configuration</h2>
        <p className="text-sm text-gray-600 mt-1">Customize your event settings and branding</p>
      </div>

      {/* Branding Section */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg">Branding</h3>

        <div>
          <label className="block text-sm font-medium mb-2">Brand Name</label>
          <input
            type="text"
            value={formData.brandName}
            onChange={handleBrandChange}
            placeholder="Enter your event name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Brand Color</label>
          <div className="flex gap-4">
            <input
              type="color"
              value={formData.brandColor}
              onChange={handleColorChange}
              className="w-16 h-10 border rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={formData.brandColor}
              onChange={handleColorChange}
              placeholder="#1a1f4e"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-3 p-4 rounded-lg" style={{ backgroundColor: formData.brandColor }}>
            <p className="text-white text-sm">Preview of your brand color</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Logo Upload</label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Drag and drop your logo here or click to browse</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
          </div>
        </div>
      </div>

      {/* Domain Configuration */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg">Custom Domain</h3>

        <div>
          <label className="block text-sm font-medium mb-2">Domain Name</label>
          <input
            type="text"
            value={formData.domain}
            onChange={handleDomainChange}
            placeholder="voting.example.com"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-2">Configure DNS CNAME to point to our servers</p>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg">Pricing Tiers</h3>

        <div className="space-y-4">
          {formData.pricingTiers.map((tier, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tier Name</label>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => handlePricingChange(idx, 'name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Votes Included</label>
                  <input
                    type="number"
                    value={tier.votes}
                    onChange={(e) => handlePricingChange(idx, 'votes', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={tier.price}
                    onChange={(e) => handlePricingChange(idx, 'price', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring Weights */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg">Scoring Algorithm Weights</h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-900">
            Total weight: {(formData.scoringWeights.presentation + formData.scoringWeights.talent + formData.scoringWeights.answers).toFixed(2)} (must equal 1.0)
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(formData.scoringWeights).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium capitalize">{key} Score Weight</label>
                <span className="text-sm font-semibold">{(value * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={value}
                onChange={(e) =>
                  handleWeightChange(key as 'presentation' | 'talent' | 'answers', parseFloat(e.target.value))
                }
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Indicator */}
      {savedIndicator && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-sm text-green-700">Configuration saved successfully!</span>
        </div>
      )}

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full">
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving Configuration...' : 'Save Configuration'}
      </Button>
    </div>
  );
}
