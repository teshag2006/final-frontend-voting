import {
  mockSponsorCampaignTracking,
  mockSponsorDashboardOverview,
  mockSponsorProfileSettings,
  type SponsorCampaignTracking,
  type SponsorDashboardOverview,
  type SponsorProfileSettings,
} from '@/lib/sponsorship-mock';

export interface SponsorAuditEntry {
  id: string;
  at: string;
  action: string;
  entityType: 'campaign' | 'settings';
  entityId: string;
  detail: string;
}

export interface CreateSponsorCampaignPayload {
  action: 'save_draft' | 'submit_review';
  sponsorName: string;
  contestantSlug: string;
  campaignTitle: string;
  paymentReference?: string;
  deliverablesTotal: number;
}

let campaignTrackingStore: SponsorCampaignTracking[] = [...mockSponsorCampaignTracking];
let settingsStore: SponsorProfileSettings = structuredClone(mockSponsorProfileSettings);
let auditTrailStore: SponsorAuditEntry[] = [];

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addAudit(entry: Omit<SponsorAuditEntry, 'id' | 'at'>) {
  auditTrailStore.unshift({
    id: makeId('audit'),
    at: nowIso(),
    ...entry,
  });
  auditTrailStore = auditTrailStore.slice(0, 50);
}

export function getSponsorCampaignTracking(contestantSlug?: string): SponsorCampaignTracking[] {
  if (!contestantSlug) return [...campaignTrackingStore];
  return campaignTrackingStore.filter((item) => item.contestantSlug === contestantSlug);
}

export function createSponsorCampaign(payload: CreateSponsorCampaignPayload): SponsorCampaignTracking {
  const row: SponsorCampaignTracking = {
    id: makeId('track'),
    contestantSlug: payload.contestantSlug,
    sponsorName: payload.sponsorName,
    campaignStatus: payload.action === 'save_draft' ? 'draft' : 'under_review',
    paymentStatus: 'pending_manual',
    deliverablesSubmitted: 0,
    deliverablesTotal: Math.max(1, payload.deliverablesTotal || 1),
    adminNotes:
      payload.action === 'save_draft'
        ? `Draft saved: ${payload.campaignTitle}`
        : `Submitted for admin review: ${payload.campaignTitle}`,
  };

  campaignTrackingStore = [row, ...campaignTrackingStore];
  addAudit({
    action: payload.action === 'save_draft' ? 'campaign_draft_saved' : 'campaign_submitted_for_review',
    entityType: 'campaign',
    entityId: row.id,
    detail: `${payload.campaignTitle} (${payload.contestantSlug})`,
  });

  return row;
}

export function updateSponsorSettings(next: SponsorProfileSettings): SponsorProfileSettings {
  settingsStore = structuredClone(next);
  addAudit({
    action: 'settings_updated',
    entityType: 'settings',
    entityId: 'sponsor-profile',
    detail: `Profile completion ${settingsStore.profileCompletion}%`,
  });
  return structuredClone(settingsStore);
}

export function getSponsorSettings(): SponsorProfileSettings {
  return structuredClone(settingsStore);
}

export function getSponsorAuditTrail(): SponsorAuditEntry[] {
  return [...auditTrailStore];
}

export function getSponsorOverview(): SponsorDashboardOverview {
  const pendingPayments = campaignTrackingStore.filter((item) => item.paymentStatus === 'pending_manual').length;
  const activeCampaigns = campaignTrackingStore.filter((item) => item.campaignStatus === 'active').length;
  return {
    ...mockSponsorDashboardOverview,
    pendingPayments,
    activeCampaigns,
  };
}
