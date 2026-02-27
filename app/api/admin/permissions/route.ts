import { NextRequest, NextResponse } from 'next/server';
import type { RoleType } from '@/components/admin/permissions-matrix';
import { generateMockPermissions } from '@/lib/users-roles-mock';
import {
  getAdminPermissions,
  seedAdminPermissions,
  updateAdminPermission,
} from '@/lib/admin-permissions-runtime-store';

let seeded = false;

function ensureSeeded() {
  if (seeded) return;
  seedAdminPermissions(generateMockPermissions());
  seeded = true;
}

export async function GET() {
  ensureSeeded();
  return NextResponse.json(getAdminPermissions());
}

export async function PATCH(request: NextRequest) {
  ensureSeeded();
  const payload = (await request.json()) as {
    role?: RoleType;
    module?: string;
    action?: 'view' | 'create' | 'update' | 'delete';
    value?: boolean;
  };

  const role = payload.role;
  const module = String(payload.module || '').trim();
  const action = payload.action;

  if (!role || !module || !action || typeof payload.value !== 'boolean') {
    return NextResponse.json(
      { message: 'role, module, action, and boolean value are required' },
      { status: 400 }
    );
  }

  const updated = updateAdminPermission(role, module, action, payload.value);
  if (!updated) {
    return NextResponse.json({ message: 'Permission target not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
