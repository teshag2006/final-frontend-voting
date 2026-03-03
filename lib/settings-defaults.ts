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
