import { NextRequest, NextResponse } from 'next/server';
import type { AuditEntry } from '@/components/admin/role-audit-table';
import { generateMockAuditEntries } from '@/lib/users-roles-mock';
import {
  appendAdminAudit,
  getAdminAudit,
  seedAdminAudit,
} from '@/lib/admin-audit-runtime-store';

let seeded = false;

function ensureSeeded() {
  if (seeded) return;
  seedAdminAudit(generateMockAuditEntries(50));
  seeded = true;
}

export async function GET() {
  ensureSeeded();
  return NextResponse.json(getAdminAudit());
}

export async function POST(request: NextRequest) {
  ensureSeeded();
  const payload = (await request.json()) as {
    action?: AuditEntry['action'];
    actor?: string;
    target?: string;
    details?: string;
    riskLevel?: AuditEntry['riskLevel'];
  };

  if (!payload.action || !payload.actor || !payload.target || !payload.details || !payload.riskLevel) {
    return NextResponse.json(
      { message: 'action, actor, target, details, riskLevel are required' },
      { status: 400 }
    );
  }

  const created = appendAdminAudit({
    action: payload.action,
    actor: payload.actor,
    target: payload.target,
    details: payload.details,
    riskLevel: payload.riskLevel,
  });

  return NextResponse.json(created, { status: 201 });
}
