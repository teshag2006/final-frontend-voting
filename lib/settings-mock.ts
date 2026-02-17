export function getDefaultGeneralSettings() {
  return {
    systemName: 'Voting Platform',
    defaultLanguage: 'en',
    timezone: 'UTC',
    currency: 'USD',
    supportEmail: 'support@example.com',
    termsConditionsUrl: 'https://example.com/terms',
  };
}

export function getDefaultEventSettings() {
  return {
    autoPublishResults: false,
    allowScheduleEditsAfterLaunch: false,
    defaultVotingDurationHours: 72,
    maxContestantsPerCategory: 100,
  };
}

export function getDefaultPaymentSettings() {
  return {
    primaryProvider: 'stripe',
    fallbackProvider: 'paypal',
    currency: 'USD',
    retryFailedPayments: true,
  };
}

export function getDefaultSecuritySettings() {
  return {
    jwtExpirationTime: 3600,
    refreshTokenExpiration: 604800,
    passwordStrengthPolicy: 'high',
    maxLoginAttempts: 5,
    rateLimitPerIP: 120,
    enable2FA: true,
    enableIPWhitelisting: false,
  };
}

export function getDefaultFraudDetectionSettings() {
  return {
    velocityThresholdPerMinute: 20,
    autoBlockCriticalRisk: true,
    trustScoreThreshold: 30,
  };
}

export function getDefaultBlockchainSettings() {
  return {
    network: 'POLYGON',
    autoAnchorIntervalMinutes: 30,
    retries: 3,
  };
}

export function getDefaultNotificationSettings() {
  return {
    emailEnabled: true,
    smsEnabled: false,
    inAppEnabled: true,
    criticalAlertsOnly: false,
  };
}
