import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminSettingsAuditLog,
  getAdminSettingsBundle,
  type SettingsCategory,
  updateAdminSettingsCategory,
} from '@/lib/admin-settings-runtime-store';

const allowedCategories: SettingsCategory[] = [
  'general',
  'event',
  'payment',
  'security',
  'fraud',
  'blockchain',
  'notifications',
];

export async function GET() {
  return NextResponse.json({
    settings: getAdminSettingsBundle(),
    audit: getAdminSettingsAuditLog(),
  });
}

export async function PATCH(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as {
    category?: string;
    data?: Record<string, unknown>;
  };
  const category = String(payload.category || '').trim() as SettingsCategory;
  if (!allowedCategories.includes(category)) {
    return NextResponse.json({ message: 'Invalid settings category' }, { status: 400 });
  }
  if (!payload.data || typeof payload.data !== 'object') {
    return NextResponse.json({ message: 'data object is required' }, { status: 400 });
  }
  const result = updateAdminSettingsCategory(category, payload.data);
  return NextResponse.json(result);
}

