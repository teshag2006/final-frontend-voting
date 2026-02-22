import { NextRequest, NextResponse } from 'next/server';
import { runAdminMaintenanceAction } from '@/lib/admin-settings-runtime-store';

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as { actionName?: string };
  const actionName = String(payload.actionName || '').trim();
  if (!actionName) {
    return NextResponse.json({ message: 'actionName is required' }, { status: 400 });
  }
  try {
    return NextResponse.json(runAdminMaintenanceAction(actionName));
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Maintenance action failed' },
      { status: 400 }
    );
  }
}

