export type SettingsCategory =
  | 'general'
  | 'event'
  | 'payment'
  | 'security'
  | 'fraud'
  | 'blockchain'
  | 'notifications';

export interface SettingsAuditEntry {
  id: string;
  at: string;
  category: SettingsCategory | 'maintenance';
  action: 'update' | 'maintenance';
  summary: string;
  version: number;
}

export interface GeneralSettings {
  [key: string]: unknown;
  platformName?: string;
  systemName?: string;
  siteTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalBaseUrl?: string;
  defaultOgImageUrl?: string;
  defaultLanguage?: string;
  supportEmail: string;
  timezone: string;
  defaultLocale?: string;
  currency?: string;
  termsConditionsUrl?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export interface EventSettings {
  [key: string]: unknown;
  autoPublishResults: boolean;
  allowScheduleEditsAfterLaunch: boolean;
  defaultVotingDurationHours: number;
  maxContestantsPerCategory: number;
  maxGalleryPhotosPerContestant: number;
}

export interface PaymentSettings {
  [key: string]: unknown;
  primaryProvider: string;
  fallbackProvider: string;
  currency: string;
  retryFailedPayments: boolean;
}

export interface SecuritySettings {
  [key: string]: unknown;
  require2FAForAdmins?: boolean;
  enforceStrongPasswords?: boolean;
  sessionTimeoutMinutes?: number;
  jwtExpirationTime?: number;
  refreshTokenExpiration?: number;
  passwordStrengthPolicy?: string;
  maxLoginAttempts?: number;
  rateLimitPerIP?: number;
  enable2FA?: boolean;
  enableIPWhitelisting?: boolean;
}

export interface FraudSettings {
  [key: string]: unknown;
  velocityThresholdPerMinute: number;
  autoBlockCriticalRisk: boolean;
  trustScoreThreshold: number;
}

export interface BlockchainSettings {
  [key: string]: unknown;
  network: string;
  autoAnchorIntervalMinutes: number;
  retries: number;
}

export interface NotificationSettings {
  [key: string]: unknown;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  criticalAlertsOnly: boolean;
}

export interface AdminSettingsBundle {
  general: GeneralSettings;
  event: EventSettings;
  payment: PaymentSettings;
  security: SecuritySettings;
  fraud: FraudSettings;
  blockchain: BlockchainSettings;
  notifications: NotificationSettings;
}

let settingsStore: AdminSettingsBundle = {
  general: {
    platformName: 'Campus Star',
    systemName: 'Campus Star',
    siteTitle: 'Campus Star Voting',
    metaDescription: '',
    metaKeywords: '',
    canonicalBaseUrl: '',
    defaultOgImageUrl: '',
    defaultLanguage: 'en',
    supportEmail: 'support@campusstar.com',
    timezone: 'UTC',
    defaultLocale: 'en',
    currency: 'USD',
    termsConditionsUrl: '',
    logoUrl: '',
    faviconUrl: '',
  },
  event: {
    autoPublishResults: false,
    allowScheduleEditsAfterLaunch: false,
    defaultVotingDurationHours: 72,
    maxContestantsPerCategory: 100,
    maxGalleryPhotosPerContestant: 10,
  },
  payment: {
    primaryProvider: 'stripe',
    fallbackProvider: 'paypal',
    currency: 'USD',
    retryFailedPayments: true,
  },
  security: {
    require2FAForAdmins: true,
    enforceStrongPasswords: true,
    sessionTimeoutMinutes: 60,
    jwtExpirationTime: 3600,
    refreshTokenExpiration: 604800,
    passwordStrengthPolicy: 'strong',
    maxLoginAttempts: 5,
    rateLimitPerIP: 120,
    enable2FA: true,
    enableIPWhitelisting: false,
  },
  fraud: {
    velocityThresholdPerMinute: 20,
    autoBlockCriticalRisk: true,
    trustScoreThreshold: 30,
  },
  blockchain: {
    network: 'POLYGON',
    autoAnchorIntervalMinutes: 30,
    retries: 3,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: false,
    inAppEnabled: true,
    criticalAlertsOnly: false,
  },
};

let settingsVersion = 1;
let auditLogStore: SettingsAuditEntry[] = [
  {
    id: 'set-audit-1',
    at: new Date().toISOString(),
    category: 'general',
    action: 'update',
    summary: 'Initialized admin settings with default values.',
    version: settingsVersion,
  },
];

function mkId() {
  return `set-audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getAdminSettingsBundle() {
  return structuredClone(settingsStore);
}

export function getAdminSettingsAuditLog() {
  return structuredClone(auditLogStore);
}

export function updateAdminSettingsCategory(
  category: SettingsCategory,
  patch: object
) {
  const current = settingsStore[category];
  settingsStore = {
    ...settingsStore,
    [category]: {
      ...current,
      ...patch,
    },
  };
  settingsVersion += 1;
  auditLogStore = [
    {
      id: mkId(),
      at: new Date().toISOString(),
      category,
      action: 'update' as const,
      summary: `Updated ${category} settings.`,
      version: settingsVersion,
    },
    ...auditLogStore,
  ].slice(0, 100);

  return {
    settings: structuredClone(settingsStore[category]),
    version: settingsVersion,
  };
}

export function runAdminMaintenanceAction(actionName: string) {
  const safeName = String(actionName || '').trim();
  if (!safeName) {
    throw new Error('actionName is required');
  }
  settingsVersion += 1;
  auditLogStore = [
    {
      id: mkId(),
      at: new Date().toISOString(),
      category: 'maintenance' as const,
      action: 'maintenance' as const,
      summary: `Executed maintenance action: ${safeName}`,
      version: settingsVersion,
    },
    ...auditLogStore,
  ].slice(0, 100);

  return {
    success: true,
    actionName: safeName,
    version: settingsVersion,
    executedAt: new Date().toISOString(),
  };
}
