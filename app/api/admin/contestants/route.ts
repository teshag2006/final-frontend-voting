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
import { isContestantGender } from '@/lib/contestant-gender';

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
  if (
    !payload.id ||
    !payload.name ||
    !payload.category ||
    !payload.categoryId ||
    !payload.status ||
    !payload.createdAt ||
    !Number.isFinite(Number(payload.age)) ||
    Number(payload.age) < 13 ||
    Number(payload.age) > 120 ||
    !isContestantGender(payload.gender)
  ) {
    return NextResponse.json({ message: 'Invalid contestant payload' }, { status: 400 });
  }
  const created = createAdminContestant({
    id: String(payload.id),
    slug: payload.slug ? String(payload.slug) : undefined,
    name: String(payload.name),
    age: Number(payload.age),
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
    introVideoUrl: payload.introVideoUrl ? String(payload.introVideoUrl) : undefined,
    gender: payload.gender,
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
  if (patch.gender !== undefined && !isContestantGender(patch.gender)) {
    return NextResponse.json({ message: 'Invalid gender' }, { status: 400 });
  }
  if (
    patch.age !== undefined &&
    (!Number.isFinite(Number(patch.age)) || Number(patch.age) < 13 || Number(patch.age) > 120)
  ) {
    return NextResponse.json({ message: 'Invalid age' }, { status: 400 });
  }
  const normalizedPatch: Partial<AdminContestantRecord> = {
    ...patch,
    ...(patch.slug !== undefined ? { slug: String(patch.slug) } : {}),
    ...(patch.name !== undefined ? { name: String(patch.name) } : {}),
    ...(patch.age !== undefined ? { age: Number(patch.age) } : {}),
    ...(patch.gender !== undefined ? { gender: patch.gender } : {}),
  };
  const updated = updateAdminContestant(id, normalizedPatch);
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
