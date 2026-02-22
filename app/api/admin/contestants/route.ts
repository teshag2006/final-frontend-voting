import { NextRequest, NextResponse } from 'next/server';
import {
  createAdminContestant,
  deleteAdminContestant,
  getAdminContestants,
  seedAdminContestants,
  type AdminContestantRecord,
  updateAdminContestant,
} from '@/lib/admin-contestants-runtime-store';
import { generateMockContestants } from '@/lib/contestants-management-mock';

let seeded = false;

function ensureSeeded() {
  if (seeded) return;
  seedAdminContestants(generateMockContestants(120) as AdminContestantRecord[]);
  seeded = true;
}

export async function GET() {
  ensureSeeded();
  return NextResponse.json(getAdminContestants());
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<AdminContestantRecord>;
  if (!payload.id || !payload.name || !payload.category || !payload.categoryId || !payload.status || !payload.createdAt) {
    return NextResponse.json({ message: 'Invalid contestant payload' }, { status: 400 });
  }
  const created = createAdminContestant({
    id: String(payload.id),
    name: String(payload.name),
    bio: payload.bio ? String(payload.bio) : '',
    category: String(payload.category),
    categoryId: String(payload.categoryId),
    status: payload.status,
    totalVotes: Number(payload.totalVotes || 0),
    revenue: Number(payload.revenue || 0),
    createdAt: String(payload.createdAt),
    avatar: payload.avatar ? String(payload.avatar) : undefined,
    galleryImages: Array.isArray(payload.galleryImages) ? payload.galleryImages.map((item) => String(item)) : [],
    email: payload.email ? String(payload.email) : undefined,
  });
  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const payload = (await request.json()) as { id?: string; patch?: Partial<AdminContestantRecord> };
  const id = String(payload.id || '').trim();
  if (!id) {
    return NextResponse.json({ message: 'id is required' }, { status: 400 });
  }
  const patch = payload.patch || {};
  const updated = updateAdminContestant(id, patch);
  if (!updated) {
    return NextResponse.json({ message: 'Contestant not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = String(searchParams.get('id') || '').trim();
  if (!id) {
    return NextResponse.json({ message: 'id is required' }, { status: 400 });
  }
  const ok = deleteAdminContestant(id);
  if (!ok) {
    return NextResponse.json({ message: 'Contestant not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

