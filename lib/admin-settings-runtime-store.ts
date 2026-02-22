import {
  getDefaultBlockchainSettings,
  getDefaultEventSettings,
  getDefaultFraudDetectionSettings,
  getDefaultGeneralSettings,
  getDefaultNotificationSettings,
  getDefaultPaymentSettings,
  getDefaultSecuritySettings,
} from '@/lib/settings-mock';

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

export interface AdminSettingsBundle {
  general: ReturnType<typeof getDefaultGeneralSettings>;
  event: ReturnType<typeof getDefaultEventSettings>;
  payment: ReturnType<typeof getDefaultPaymentSettings>;
  security: ReturnType<typeof getDefaultSecuritySettings>;
  fraud: ReturnType<typeof getDefaultFraudDetectionSettings>;
  blockchain: ReturnType<typeof getDefaultBlockchainSettings>;
  notifications: ReturnType<typeof getDefaultNotificationSettings>;
}

let settingsStore: AdminSettingsBundle = {
  general: getDefaultGeneralSettings(),
  event: getDefaultEventSettings(),
  payment: getDefaultPaymentSettings(),
  security: getDefaultSecuritySettings(),
  fraud: getDefaultFraudDetectionSettings(),
  blockchain: getDefaultBlockchainSettings(),
  notifications: getDefaultNotificationSettings(),
};

let settingsVersion = 1;
let auditLogStore: SettingsAuditEntry[] = [
  {
    id: 'set-audit-1',
    at: new Date().toISOString(),
    category: 'general',
    action: 'update',
    summary: 'Initialized admin settings with default mock values.',
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
  patch: Record<string, unknown>
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
