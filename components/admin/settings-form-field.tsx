'use client';

import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SettingsFormFieldProps {
  label: string;
  description?: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
}

export function SettingsFormField({
  label,
  description,
  children,
  error,
  required,
}: SettingsFormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="font-medium text-slate-900">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      </div>
      {description && <p className="text-sm text-slate-500">{description}</p>}
      {children}
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
}
