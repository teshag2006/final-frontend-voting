export function getDefaultGeneralSettings() {
  return {
    systemName: 'Voting Platform',
    siteTitle: 'Voting Platform',
    metaDescription: 'Secure online voting platform for events, contestants, and sponsors.',
    metaKeywords: 'voting, events, leaderboard, contestants, sponsors',
    canonicalBaseUrl: 'https://example.com',
    defaultOgImageUrl: '',
    defaultLanguage: 'en',
    timezone: 'UTC',
    currency: 'USD',
    supportEmail: 'support@example.com',
    termsConditionsUrl: 'https://example.com/terms',
    logoUrl: '',
    faviconUrl: '',
  };
}

export function getDefaultEventSettings() {
  return {
    autoPublishResults: false,
    allowScheduleEditsAfterLaunch: false,
    defaultVotingDurationHours: 72,
    maxContestantsPerCategory: 100,
    maxGalleryPhotosPerContestant: 10,
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

export function getDefaultSystemSocialSettings() {
  return {
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    youtubeUrl: 'https://youtube.com',
    xUrl: 'https://x.com',
    facebookUrl: 'https://facebook.com',
    linkedinUrl: '',
    telegramUrl: '',
    showInstagram: true,
    showTikTok: true,
    showYouTube: true,
    showX: true,
    showFacebook: true,
    showLinkedIn: false,
    showTelegram: false,
  };
}
