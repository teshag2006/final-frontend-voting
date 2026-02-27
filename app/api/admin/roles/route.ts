import { NextRequest, NextResponse } from 'next/server';
import { generateMockRoles } from '@/lib/users-roles-mock';
import {
  getAdminRoles,
  seedAdminRoles,
  updateAdminRole,
} from '@/lib/admin-roles-runtime-store';

let seeded = false;

function ensureSeeded() {
  if (seeded) return;
  seedAdminRoles(generateMockRoles());
  seeded = true;
}

export async function GET() {
  ensureSeeded();
  return NextResponse.json(getAdminRoles());
}

export async function PATCH(request: NextRequest) {
  ensureSeeded();
  const payload = (await request.json()) as {
    id?: string;
    patch?: {
      description?: string;
      userCount?: number;
    };
  };

  const id = String(payload.id || '').trim();
  if (!id) {
    return NextResponse.json({ message: 'id is required' }, { status: 400 });
  }

  const updated = updateAdminRole(id, payload.patch || {});
  if (!updated) {
    return NextResponse.json({ message: 'Role not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}
