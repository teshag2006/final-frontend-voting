import { NextRequest, NextResponse } from 'next/server';
import { generateMockAdminUsers } from '@/lib/users-roles-mock';
import {
  createAdminUser,
  getAdminUsers,
  seedAdminUsers,
  updateAdminUser,
  type AdminUserRecord,
  type AdminUserRole,
} from '@/lib/admin-users-runtime-store';

let seeded = false;

function ensureSeeded() {
  if (seeded) return;
  seedAdminUsers(generateMockAdminUsers(25) as AdminUserRecord[]);
  seeded = true;
}

const VALID_ROLES: AdminUserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'FINANCE_ADMIN',
  'FRAUD_ADMIN',
  'MEDIA_ADMIN',
  'VIEW_ONLY_ADMIN',
];

export async function GET() {
  ensureSeeded();
  return NextResponse.json(getAdminUsers());
}

export async function POST(request: NextRequest) {
  ensureSeeded();
  const payload = (await request.json()) as {
    fullName?: string;
    email?: string;
    role?: AdminUserRole;
    is2FAEnabled?: boolean;
    status?: 'ACTIVE' | 'DISABLED' | 'LOCKED';
  };

  const fullName = String(payload.fullName || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const role = payload.role;

  if (!fullName || !email || !role || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ message: 'fullName, email and valid role are required' }, { status: 400 });
  }

  const created = createAdminUser({
    fullName,
    email,
    role,
    is2FAEnabled: Boolean(payload.is2FAEnabled),
    status: payload.status || 'ACTIVE',
  });
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  ensureSeeded();
  const payload = (await request.json()) as {
    id?: string;
    patch?: Partial<AdminUserRecord>;
  };
  const id = String(payload.id || '').trim();
  if (!id) {
    return NextResponse.json({ message: 'id is required' }, { status: 400 });
  }
  const updated = updateAdminUser(id, payload.patch || {});
  if (!updated) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

