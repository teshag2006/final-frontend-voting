import { NextRequest, NextResponse } from 'next/server';
import {
  createAdminFooterLink,
  createAdminHomepageSlider,
  createAdminNavigationMenuItem,
  createAdminSponsorBanner,
  getAdminContentState,
  patchAdminContentState,
  type AdminContentState,
} from '@/lib/admin-content-runtime-store';

export async function GET() {
  return NextResponse.json(getAdminContentState());
}

export async function PATCH(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as Partial<AdminContentState>;
  return NextResponse.json(patchAdminContentState(payload));
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as
    | { kind?: 'banner'; data?: Record<string, unknown> }
    | { kind?: 'slider'; data?: Record<string, unknown> }
    | { kind?: 'menu'; data?: Record<string, unknown> }
    | { kind?: 'footer'; data?: Record<string, unknown> };

  if (payload.kind === 'banner') {
    const data = payload.data || {};
    if (!data.title || !data.imageUrl || !data.targetUrl || !data.placement) {
      return NextResponse.json({ message: 'Invalid banner payload' }, { status: 400 });
    }
    return NextResponse.json(
      createAdminSponsorBanner({
        title: String(data.title),
        imageUrl: String(data.imageUrl),
        targetUrl: String(data.targetUrl),
        placement: String(data.placement) as 'homepage_top' | 'homepage_sidebar' | 'contestant_profile',
        active: Boolean(data.active),
      }),
      { status: 201 }
    );
  }

  if (payload.kind === 'slider') {
    const data = payload.data || {};
    if (!data.headline || !data.imageUrl || !data.ctaLabel || !data.ctaUrl) {
      return NextResponse.json({ message: 'Invalid slider payload' }, { status: 400 });
    }
    return NextResponse.json(
      createAdminHomepageSlider({
        headline: String(data.headline),
        subheadline: String(data.subheadline || ''),
        imageUrl: String(data.imageUrl),
        ctaLabel: String(data.ctaLabel),
        ctaUrl: String(data.ctaUrl),
        order: Number(data.order || 1),
        active: Boolean(data.active),
      }),
      { status: 201 }
    );
  }

  if (payload.kind === 'menu') {
    const data = payload.data || {};
    if (!data.label || !data.href || !data.position) {
      return NextResponse.json({ message: 'Invalid menu payload' }, { status: 400 });
    }
    return NextResponse.json(
      createAdminNavigationMenuItem({
        label: String(data.label),
        href: String(data.href),
        position: String(data.position) as 'header' | 'mobile',
        order: Number(data.order || 1),
        visible: data.visible !== false,
      }),
      { status: 201 }
    );
  }

  if (payload.kind === 'footer') {
    const data = payload.data || {};
    if (!data.label || !data.href || !data.group) {
      return NextResponse.json({ message: 'Invalid footer payload' }, { status: 400 });
    }
    return NextResponse.json(
      createAdminFooterLink({
        label: String(data.label),
        href: String(data.href),
        group: String(data.group) as 'Platform' | 'Company' | 'Legal' | 'Social',
        order: Number(data.order || 1),
        visible: data.visible !== false,
      }),
      { status: 201 }
    );
  }

  return NextResponse.json({ message: 'Invalid content kind' }, { status: 400 });
}
