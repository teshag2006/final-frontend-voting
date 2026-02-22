export type ContestantSubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected';

export interface ContestantMediaItem {
  id: string;
  kind: 'profile_photo' | 'gallery_image' | 'intro_video_embed';
  label: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ContestantComplianceData {
  legalName: string;
  birthDate: string;
  country: string;
  idDocumentName: string;
  termsAccepted: boolean;
  consentAccepted: boolean;
}

export interface ContestantProfileComposerData {
  displayName: string;
  bio: string;
  category: string;
  location: string;
  instagram: string;
  tiktok: string;
  youtube: string;
}

export interface ContestantOnboardingData {
  fullName: string;
  stageName: string;
  email: string;
  phone: string;
  category: string;
}

export interface ContestantReadiness {
  score: number;
  checks: Array<{ id: string; label: string; done: boolean }>;
}

export interface ContestantAuditItem {
  id: string;
  at: string;
  action: string;
  detail: string;
}

export interface ContestantSponsorOfferThreadMessage {
  id: string;
  at: string;
  by: 'contestant' | 'sponsor' | 'admin';
  message: string;
}

export interface ContestantSponsorOfferItem {
  id: string;
  sponsorName: string;
  trustBadge: boolean;
  deliverables: string[];
  durationDays: number;
  agreedPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiation';
  thread: ContestantSponsorOfferThreadMessage[];
}

export interface ContestantSponsorContract {
  campaignId: string;
  sponsorName: string;
  title: string;
  payoutMilestones: Array<{ name: string; amountUsd: number; dueInDays: number; status: 'pending' | 'paid' }>;
  terms: string[];
}

export interface ContestantDeliverableItem {
  id: string;
  campaignId: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  proofUrl?: string;
}

export interface ContestantAttributionItem {
  label: string;
  impressions: number;
  clicks: number;
  conversions: number;
  deliverable: string;
}

export interface ContestantAudienceInsight {
  id: string;
  segment: string;
  value: string;
  deltaPct: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ContestantSecurityCase {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'monitoring' | 'resolved';
  detectedAt: string;
  summary: string;
  remediationPlan: string;
}

export interface ContestantProfileVersion {
  id: string;
  at: string;
  label: string;
  note: string;
  fieldsUpdated: string[];
}

export interface ContestantShareKitLink {
  id: string;
  label: string;
  channel: 'instagram' | 'tiktok' | 'youtube' | 'x' | 'facebook';
  url: string;
  updatedAt: string;
}

export interface ContestantPublicVerification {
  identityVerified: boolean;
  mediaVerified: boolean;
  payoutReady: boolean;
  fraudReviewClear: boolean;
}

export type ContestantAdminReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ContestantPublishingState {
  submissionStatus: ContestantSubmissionStatus;
  adminReviewStatus: ContestantAdminReviewStatus;
  published: boolean;
  profileLocked: boolean;
  rejectionReason?: string;
}

export interface ContestantChangeRequest {
  id: string;
  requestedAt: string;
  type: 'onboarding' | 'profile' | 'media' | 'compliance';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  payload: Record<string, unknown>;
  reviewedAt?: string;
  reviewNote?: string;
}

let onboardingStore: ContestantOnboardingData = {
  fullName: 'Amina Tesfaye',
  stageName: 'Amina T.',
  email: 'amina.tesfaye@example.com',
  phone: '+251 900 111 222',
  category: 'Singing',
};

let profileStore: ContestantProfileComposerData = {
  displayName: 'Amina T.',
  bio: 'Singer and performer focused on afro-fusion and live storytelling.',
  category: 'Singing',
  location: 'Addis Ababa, Ethiopia',
  instagram: '@amina.live',
  tiktok: '@amina.music',
  youtube: '@aminaofficial',
};

let complianceStore: ContestantComplianceData = {
  legalName: 'Amina Tesfaye',
  birthDate: '2000-05-12',
  country: 'Ethiopia',
  idDocumentName: 'ID-Front.pdf',
  termsAccepted: true,
  consentAccepted: true,
};

let mediaStore: ContestantMediaItem[] = [
  {
    id: 'media-1',
    kind: 'profile_photo',
    label: 'Main Profile Photo',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
    status: 'approved',
  },
  {
    id: 'media-2',
    kind: 'intro_video_embed',
    label: 'Intro Video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    status: 'pending',
  },
];

let submissionStatusStore: ContestantSubmissionStatus = 'draft';
let adminReviewStatusStore: ContestantAdminReviewStatus = 'pending';
let rejectionReasonStore: string | undefined;

let auditStore: ContestantAuditItem[] = [];
let sponsorOffersStore: ContestantSponsorOfferItem[] = [
  {
    id: 'offer-01',
    sponsorName: 'Zenith Bank',
    trustBadge: true,
    deliverables: ['Instagram Feed: 1 post', 'Facebook Feed: 1 post', 'Instagram Story: 1 set'],
    durationDays: 14,
    agreedPrice: 1800,
    status: 'pending',
    thread: [
      {
        id: 'thread-1',
        at: new Date().toISOString(),
        by: 'sponsor',
        message: 'We would like to start next Monday and prioritize one launch video.',
      },
    ],
  },
  {
    id: 'offer-02',
    sponsorName: 'MTN',
    trustBadge: true,
    deliverables: ['Instagram Reel: 1 video', 'TikTok Video: 1 post', 'Instagram Story: 2 mentions'],
    durationDays: 10,
    agreedPrice: 1300,
    status: 'negotiation',
    thread: [
      {
        id: 'thread-2',
        at: new Date().toISOString(),
        by: 'contestant',
        message: 'Can we adjust reel timeline by +2 days due to live event schedule?',
      },
    ],
  },
];

let sponsorContractsStore: ContestantSponsorContract[] = [
  {
    campaignId: 'camp-active-101',
    sponsorName: 'Zenith Bank',
    title: 'Spring Visibility Contract',
    payoutMilestones: [
      { name: 'Activation', amountUsd: 600, dueInDays: 2, status: 'paid' },
      { name: 'Mid-campaign', amountUsd: 600, dueInDays: 8, status: 'pending' },
      { name: 'Completion', amountUsd: 600, dueInDays: 14, status: 'pending' },
    ],
    terms: ['No fake engagement', 'Weekly proof required', 'Disclosure hashtag required'],
  },
];

let deliverablesStore: ContestantDeliverableItem[] = [
  {
    id: 'del-1',
    campaignId: 'camp-active-101',
    title: 'Instagram Feed post #1',
    dueDate: '2026-03-02',
    status: 'approved',
    proofUrl: 'https://instagram.com/p/example1',
  },
  {
    id: 'del-2',
    campaignId: 'camp-active-101',
    title: 'Instagram Story set #1',
    dueDate: '2026-03-05',
    status: 'submitted',
    proofUrl: 'https://instagram.com/stories/example',
  },
  {
    id: 'del-3',
    campaignId: 'camp-active-101',
    title: 'TikTok video #1',
    dueDate: '2026-03-08',
    status: 'pending',
  },
];

let attributionStore: ContestantAttributionItem[] = [
  { label: 'D1', impressions: 18000, clicks: 620, conversions: 41, deliverable: 'Feed post #1' },
  { label: 'D2', impressions: 20500, clicks: 710, conversions: 46, deliverable: 'Story set #1' },
  { label: 'D3', impressions: 22400, clicks: 780, conversions: 54, deliverable: 'Reel #1' },
  { label: 'D4', impressions: 24200, clicks: 840, conversions: 58, deliverable: 'Reel #1' },
];

let audienceInsightsStore: ContestantAudienceInsight[] = [
  { id: 'aud-1', segment: 'Age 18-24', value: '41%', deltaPct: 6.2, priority: 'high' },
  { id: 'aud-2', segment: 'Female Audience', value: '63%', deltaPct: 2.8, priority: 'medium' },
  { id: 'aud-3', segment: 'Peak Time (UTC)', value: '18:00-22:00', deltaPct: 3.5, priority: 'high' },
  { id: 'aud-4', segment: 'Top Channel', value: 'Instagram Reels', deltaPct: 4.1, priority: 'medium' },
];

let securityCasesStore: ContestantSecurityCase[] = [
  {
    id: 'sec-1',
    type: 'Voting Velocity Spike',
    severity: 'high',
    status: 'open',
    detectedAt: '2026-02-20T11:20:00.000Z',
    summary: 'Rapid vote bursts from clustered IP addresses in 8 minutes.',
    remediationPlan: 'Pause paid boost links and request manual verification.',
  },
  {
    id: 'sec-2',
    type: 'Proxy/VPN Pattern',
    severity: 'medium',
    status: 'monitoring',
    detectedAt: '2026-02-19T09:10:00.000Z',
    summary: 'Elevated proxy signatures from 2 geographies.',
    remediationPlan: 'Raise challenge score and monitor recurrence for 48h.',
  },
  {
    id: 'sec-3',
    type: 'Duplicate Device Fingerprint',
    severity: 'low',
    status: 'resolved',
    detectedAt: '2026-02-18T16:05:00.000Z',
    summary: 'Multiple accounts with matching browser/device traits.',
    remediationPlan: 'Auto-blocked suspicious accounts and removed flagged votes.',
  },
];

let profileVersionsStore: ContestantProfileVersion[] = [
  {
    id: 'pv-1',
    at: '2026-02-20T15:05:00.000Z',
    label: 'Sponsor Ready Bio',
    note: 'Updated bio and social links for sponsor review.',
    fieldsUpdated: ['bio', 'instagram', 'tiktok'],
  },
  {
    id: 'pv-2',
    at: '2026-02-17T10:30:00.000Z',
    label: 'Category Refresh',
    note: 'Adjusted category wording and location details.',
    fieldsUpdated: ['category', 'location'],
  },
];

let shareKitStore: ContestantShareKitLink[] = [
  {
    id: 'share-1',
    label: 'Main Voting Page',
    channel: 'instagram',
    url: 'https://castaway.example/events/miss-africa-2026/contestant/amina-t',
    updatedAt: '2026-02-20T14:00:00.000Z',
  },
  {
    id: 'share-2',
    label: 'Sponsor Media Deck',
    channel: 'youtube',
    url: 'https://cdn.castaway.example/amina/media-deck.pdf',
    updatedAt: '2026-02-19T18:15:00.000Z',
  },
];

let publicVerificationStore: ContestantPublicVerification = {
  identityVerified: true,
  mediaVerified: true,
  payoutReady: true,
  fraudReviewClear: true,
};

let changeRequestsStore: ContestantChangeRequest[] = [];

function mkId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function pushAudit(action: string, detail: string) {
  auditStore.unshift({
    id: mkId('audit'),
    at: new Date().toISOString(),
    action,
    detail,
  });
  auditStore = auditStore.slice(0, 100);
}

function getContestantPublicSlug() {
  const raw = profileStore.displayName || onboardingStore.stageName || onboardingStore.fullName || 'contestant';
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isProfileLockedInternal() {
  return adminReviewStatusStore === 'approved';
}

function getPublishingStateInternal(): ContestantPublishingState {
  const published = adminReviewStatusStore === 'approved';
  return {
    submissionStatus: submissionStatusStore,
    adminReviewStatus: adminReviewStatusStore,
    published,
    profileLocked: published,
    rejectionReason: rejectionReasonStore,
  };
}

function calculateReadiness(): ContestantReadiness {
  const checks = [
    { id: 'basic', label: 'Basic registration completed', done: Boolean(onboardingStore.fullName && onboardingStore.email) },
    { id: 'photo', label: 'Profile photo uploaded', done: mediaStore.some((m) => m.kind === 'profile_photo') },
    { id: 'video', label: 'Intro video submitted', done: mediaStore.some((m) => m.kind === 'intro_video_embed') },
    { id: 'compliance', label: 'Compliance details complete', done: Boolean(complianceStore.termsAccepted && complianceStore.consentAccepted && complianceStore.idDocumentName) },
    { id: 'profile', label: 'Public profile ready', done: Boolean(profileStore.displayName && profileStore.bio && profileStore.category) },
  ];

  const doneCount = checks.filter((item) => item.done).length;
  return {
    score: Math.round((doneCount / checks.length) * 100),
    checks,
  };
}

export function getContestantOnboarding() {
  return {
    onboarding: structuredClone(onboardingStore),
    media: structuredClone(mediaStore),
    compliance: structuredClone(complianceStore),
    profile: structuredClone(profileStore),
    submissionStatus: submissionStatusStore,
    readiness: calculateReadiness(),
  };
}

export function updateContestantOnboarding(payload: Partial<ContestantOnboardingData>) {
  onboardingStore = { ...onboardingStore, ...payload };
  pushAudit('onboarding_updated', 'Basic registration info updated');
  return structuredClone(onboardingStore);
}

export function getContestantMedia() {
  return structuredClone(mediaStore);
}

export function addContestantMedia(payload: Pick<ContestantMediaItem, 'kind' | 'label' | 'url'>) {
  const item: ContestantMediaItem = {
    id: mkId('media'),
    kind: payload.kind,
    label: payload.label,
    url: payload.url,
    status: 'pending',
  };
  mediaStore = [item, ...mediaStore];
  pushAudit('media_submitted', `${payload.kind}: ${payload.label}`);
  return item;
}

export function updateContestantCompliance(payload: Partial<ContestantComplianceData>) {
  complianceStore = { ...complianceStore, ...payload };
  pushAudit('compliance_updated', 'Compliance details updated');
  return structuredClone(complianceStore);
}

export function getContestantCompliance() {
  return structuredClone(complianceStore);
}

export function updateContestantProfile(payload: Partial<ContestantProfileComposerData>) {
  const changedFields = Object.entries(payload)
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key);
  profileStore = { ...profileStore, ...payload };
  pushAudit('profile_updated', 'Public profile content updated');
  if (changedFields.length > 0) {
    profileVersionsStore.unshift({
      id: mkId('pv'),
      at: new Date().toISOString(),
      label: 'Profile Update',
      note: 'Saved from profile editor',
      fieldsUpdated: changedFields,
    });
    profileVersionsStore = profileVersionsStore.slice(0, 20);
  }
  return structuredClone(profileStore);
}

export function getContestantProfile() {
  return structuredClone(profileStore);
}

export function updateContestantSubmissionStatus(next: ContestantSubmissionStatus) {
  submissionStatusStore = next;
  if (next === 'submitted' || next === 'under_review') {
    adminReviewStatusStore = 'pending';
    rejectionReasonStore = undefined;
  }
  pushAudit('submission_status_updated', `Status changed to ${next}`);
  return submissionStatusStore;
}

export function getContestantSubmissionStatus() {
  return submissionStatusStore;
}

export function getContestantReadiness() {
  return calculateReadiness();
}

export function getContestantAudit() {
  return structuredClone(auditStore);
}

export function getContestantSponsorOffers() {
  return structuredClone(sponsorOffersStore);
}

export function updateContestantSponsorOffer(
  offerId: string,
  payload: { action?: 'accept' | 'reject' | 'negotiate'; message?: string }
) {
  sponsorOffersStore = sponsorOffersStore.map((offer) => {
    if (offer.id !== offerId) return offer;
    let status = offer.status;
    if (payload.action === 'accept') status = 'accepted';
    if (payload.action === 'reject') status = 'rejected';
    if (payload.action === 'negotiate') status = 'negotiation';
    const thread = payload.message
      ? [
          ...offer.thread,
          {
            id: mkId('thread'),
            at: new Date().toISOString(),
            by: 'contestant' as const,
            message: payload.message,
          },
        ]
      : offer.thread;
    return { ...offer, status, thread };
  });

  pushAudit('sponsor_offer_updated', `${offerId} -> ${payload.action || 'comment'}`);
  return sponsorOffersStore.find((offer) => offer.id === offerId) || null;
}

export function getContestantSponsorContract(campaignId: string) {
  return structuredClone(sponsorContractsStore.find((item) => item.campaignId === campaignId) || null);
}

export function getContestantDeliverables(campaignId?: string) {
  if (!campaignId) return structuredClone(deliverablesStore);
  return structuredClone(deliverablesStore.filter((item) => item.campaignId === campaignId));
}

export function submitContestantDeliverableProof(payload: {
  deliverableId: string;
  proofUrl: string;
}) {
  deliverablesStore = deliverablesStore.map((item) =>
    item.id === payload.deliverableId
      ? { ...item, proofUrl: payload.proofUrl, status: 'submitted' }
      : item
  );
  pushAudit('deliverable_submitted', payload.deliverableId);
  return deliverablesStore.find((item) => item.id === payload.deliverableId) || null;
}

export function getContestantAttribution() {
  return structuredClone(attributionStore);
}

export function getContestantPriorityNotifications() {
  return [
    {
      id: 'pn-1',
      title: 'Deliverable Due in 24h',
      message: 'Reel #1 is due tomorrow for Zenith contract.',
      priority: 'high',
      read: false,
      timestamp: '2h ago',
    },
    {
      id: 'pn-2',
      title: 'Sponsor Negotiation Reply',
      message: 'MTN replied to your timeline adjustment request.',
      priority: 'medium',
      read: false,
      timestamp: '4h ago',
    },
    {
      id: 'pn-3',
      title: 'Milestone Payment Pending',
      message: 'Mid-campaign payout is pending confirmation.',
      priority: 'medium',
      read: true,
      timestamp: '1d ago',
    },
  ];
}

export function getContestantAudienceInsights() {
  return structuredClone(audienceInsightsStore);
}

export function getContestantSecurityCases() {
  return structuredClone(securityCasesStore);
}

export function updateContestantSecurityCase(
  caseId: string,
  payload: { action?: 'monitor' | 'resolve' | 'reopen'; note?: string }
) {
  securityCasesStore = securityCasesStore.map((item) => {
    if (item.id !== caseId) return item;
    let status = item.status;
    if (payload.action === 'monitor') status = 'monitoring';
    if (payload.action === 'resolve') status = 'resolved';
    if (payload.action === 'reopen') status = 'open';
    return { ...item, status };
  });
  pushAudit('security_case_updated', `${caseId} -> ${payload.action || 'updated'}${payload.note ? ` (${payload.note})` : ''}`);
  return securityCasesStore.find((item) => item.id === caseId) || null;
}

export function getContestantProfileVersions() {
  return structuredClone(profileVersionsStore);
}

export function createContestantProfileVersion(payload: {
  label: string;
  note: string;
  fieldsUpdated: string[];
}) {
  const item: ContestantProfileVersion = {
    id: mkId('pv'),
    at: new Date().toISOString(),
    label: payload.label,
    note: payload.note,
    fieldsUpdated: payload.fieldsUpdated,
  };
  profileVersionsStore = [item, ...profileVersionsStore].slice(0, 20);
  pushAudit('profile_version_created', payload.label);
  return item;
}

export function getContestantShareKit() {
  return structuredClone(shareKitStore);
}

export function upsertContestantShareKitLink(payload: {
  id?: string;
  label: string;
  channel: ContestantShareKitLink['channel'];
  url: string;
}) {
  if (payload.id) {
    shareKitStore = shareKitStore.map((item) =>
      item.id === payload.id
        ? { ...item, label: payload.label, channel: payload.channel, url: payload.url, updatedAt: new Date().toISOString() }
        : item
    );
    const updated = shareKitStore.find((item) => item.id === payload.id) || null;
    if (updated) pushAudit('share_kit_link_updated', updated.label);
    return updated;
  }
  const created: ContestantShareKitLink = {
    id: mkId('share'),
    label: payload.label,
    channel: payload.channel,
    url: payload.url,
    updatedAt: new Date().toISOString(),
  };
  shareKitStore = [created, ...shareKitStore].slice(0, 20);
  pushAudit('share_kit_link_created', created.label);
  return created;
}

export function getContestantPublicVerification() {
  return structuredClone(publicVerificationStore);
}

export function getContestantPublishingState() {
  return getPublishingStateInternal();
}

export function isContestantProfileLocked() {
  return isProfileLockedInternal();
}

export function setContestantAdminReviewStatus(payload: {
  action: 'approve' | 'reject' | 'reopen';
  reason?: string;
}) {
  if (payload.action === 'approve') {
    adminReviewStatusStore = 'approved';
    submissionStatusStore = 'approved';
    rejectionReasonStore = undefined;
    pushAudit('admin_approved_profile', 'Contestant profile approved for public publishing');
  }
  if (payload.action === 'reject') {
    adminReviewStatusStore = 'rejected';
    submissionStatusStore = 'rejected';
    rejectionReasonStore = payload.reason || 'Needs additional review updates';
    pushAudit('admin_rejected_profile', rejectionReasonStore);
  }
  if (payload.action === 'reopen') {
    adminReviewStatusStore = 'pending';
    submissionStatusStore = 'under_review';
    rejectionReasonStore = undefined;
    pushAudit('admin_reopened_review', 'Contestant moved back to under review');
  }
  return getPublishingStateInternal();
}

export function getContestantChangeRequests() {
  return structuredClone(changeRequestsStore);
}

export function createContestantChangeRequest(payload: {
  type: ContestantChangeRequest['type'];
  reason: string;
  payload: Record<string, unknown>;
}) {
  const item: ContestantChangeRequest = {
    id: mkId('cr'),
    requestedAt: new Date().toISOString(),
    type: payload.type,
    reason: payload.reason,
    status: 'pending',
    payload: payload.payload,
  };
  changeRequestsStore = [item, ...changeRequestsStore].slice(0, 100);
  pushAudit('change_request_created', `${payload.type}: ${payload.reason}`);
  return item;
}

export function reviewContestantChangeRequest(payload: {
  requestId: string;
  action: 'approve' | 'reject';
  note?: string;
}) {
  let target: ContestantChangeRequest | undefined;
  changeRequestsStore = changeRequestsStore.map((item) => {
    if (item.id !== payload.requestId) return item;
    target = {
      ...item,
      status: payload.action === 'approve' ? 'approved' : 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewNote: payload.note,
    };
    return target;
  });

  if (!target) return null;

  if (payload.action === 'approve') {
    if (target.type === 'profile') {
      profileStore = { ...profileStore, ...(target.payload as Partial<ContestantProfileComposerData>) };
    }
    if (target.type === 'onboarding') {
      onboardingStore = { ...onboardingStore, ...(target.payload as Partial<ContestantOnboardingData>) };
    }
    if (target.type === 'compliance') {
      complianceStore = { ...complianceStore, ...(target.payload as Partial<ContestantComplianceData>) };
    }
    if (target.type === 'media') {
      const mediaPayload = target.payload as Partial<ContestantMediaItem>;
      if (mediaPayload.kind && mediaPayload.label && mediaPayload.url) {
        mediaStore = [
          {
            id: mkId('media'),
            kind: mediaPayload.kind,
            label: String(mediaPayload.label),
            url: String(mediaPayload.url),
            status: 'approved',
          },
          ...mediaStore,
        ];
      }
    }
  }

  pushAudit(
    'change_request_reviewed',
    `${payload.requestId} -> ${payload.action}${payload.note ? ` (${payload.note})` : ''}`
  );
  return target;
}

export function isContestantPublicProfileVisible(slug: string) {
  const currentSlug = getContestantPublicSlug();
  if (slug !== currentSlug) return true;
  return getPublishingStateInternal().published;
}
