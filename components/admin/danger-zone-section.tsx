'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface DangerZoneSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function DangerZoneSection({ title, description, children }: DangerZoneSectionProps) {
  return (
    <Card className="border-red-200 bg-red-50 p-6">
      <div className="flex gap-4">
        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">{title}</h3>
          <p className="text-sm text-red-700 mb-4">{description}</p>
          <div className="space-y-2">{children}</div>
        </div>
      </div>
    </Card>
  );
}
