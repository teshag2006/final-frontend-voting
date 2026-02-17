'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageIcon, FileText, Download, HardDrive, Archive } from 'lucide-react';

const assets = [
  {
    id: 'logos',
    title: 'Event Logos',
    description: 'High-res event branding',
    icon: ImageIcon,
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'photos',
    title: 'Contestant Photos',
    description: 'Official contestant images',
    icon: ImageIcon,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'press',
    title: 'Press Kits',
    description: 'Media release packages',
    icon: FileText,
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    id: 'reports',
    title: 'Download Reports (PDF)',
    description: 'Comprehensive analytics',
    icon: Download,
    color: 'bg-rose-50 text-rose-600',
  },
  {
    id: 'demo',
    title: 'Demo Media',
    description: 'Sample assets and demos',
    icon: HardDrive,
    color: 'bg-amber-50 text-amber-600',
  },
];

export function MediaAssetsSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Media Assets</h2>
      
      <div className="grid gap-3 sm:grid-cols-2">
        {assets.map((asset) => {
          const Icon = asset.icon;
          return (
            <Card 
              key={asset.id}
              className="p-4 border-0 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-lg ${asset.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{asset.title}</h3>
                  <p className="text-sm text-gray-600">{asset.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
