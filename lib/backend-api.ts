/**
 * BACKEND API LAYER - All configurable settings and parameters
 * 
 * This module encapsulates ALL backend configuration, constants, and API endpoints
 * that can be manipulated from the frontend. By centralizing these here, you can:
 * - Change settings without touching UI code
 * - A/B test different configurations
 * - Implement feature flags
 * - Track analytics and metrics
 */

// ============================================================================
// AUTHENTICATION & USER SETTINGS
// ============================================================================

export const AUTH_CONFIG = {
  // Session management
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  
  // Password policy
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  passwordExpiryDays: 90,
  
  // Multi-factor authentication
  enableMFA: false,
  mfaMethods: ['email', 'sms', 'authenticator'],
  defaultMFAMethod: 'email',
  mfaCodeExpiryMinutes: 10,
  
  // OAuth settings
  enableOAuth: false,
  oauthProviders: ['google', 'facebook', 'github'],
  
  // Session security
  enableSessionBinding: true,
  enableIPTracking: true,
  enableDeviceTracking: true,
};

// ============================================================================
// VOTING SYSTEM SETTINGS
// ============================================================================

export const VOTING_CONFIG = {
  // Vote limits per user
  maxFreeVotesPerEvent: 3,
  maxPaidVotesPerEvent: 999,
  maxVotesPerDay: 10,
  maxVotesPerHour: 5,
  
  // Vote pricing
  pricePerVote: 1.99,
  currencyCode: 'USD',
  enableBulkVoting: true,
  bulkVoteDiscount: 0.15, // 15% discount for bulk (5+ votes)
  
  // Vote validation
  enableGeoFencing: false,
  enableDuplicateDetection: true,
  enableBotDetection: true,
  botDetectionThreshold: 0.85,
  
  // Vote visibility
  showVoterCount: true,
  showVoterNames: false,
  showVoteTimestamp: true,
  enableAnonymousVoting: true,
  
  // Vote categories
  allowMultipleCategoryVotes: true,
  maxCategoriesPerEvent: 10,
  allowCrossEventVoting: true,
  
  // Vote tampering prevention
  enableBlockchainVerification: true,
  enableAuditLogging: true,
  enableVoteEncryption: true,
  encryptionMethod: 'AES-256',
};

// ============================================================================
// EVENT SETTINGS
// ============================================================================

export const EVENT_CONFIG = {
  // Event timing
  maxEventDurationDays: 365,
  minEventDurationHours: 1,
  allowEventExtension: true,
  maxEventExtensions: 3,
  
  // Event types
  eventTypes: ['contest', 'election', 'poll', 'fundraiser'],
  defaultEventType: 'contest',
  
  // Event visibility
  allowPublicEvents: true,
  allowPrivateEvents: true,
  defaultEventVisibility: 'public',
  
  // Event moderation
  requireEventApproval: true,
  moderationQueue: true,
  autoApproveAfterHours: 24,
  
  // Event categories
  maxCategoriesPerEvent: 20,
  enableCustomCategories: true,
  requireCategoryDescription: true,
  
  // Event contestants
  minContestantsPerEvent: 2,
  maxContestantsPerEvent: 1000,
  allowDynamicContestantAddition: true,
  requireContestantApproval: true,
  
  // Event notifications
  notifyOnEventStart: true,
  notifyOnEventEnd: true,
  notifyOnMilestones: true,
  milestoneThresholds: [10, 50, 100, 500, 1000],
};

// ============================================================================
// CONTESTANT & PROFILE SETTINGS
// ============================================================================

export const CONTESTANT_CONFIG = {
  // Profile fields
  requiredProfileFields: ['name', 'email', 'description', 'image'],
  optionalProfileFields: ['website', 'social', 'biography', 'location'],
  
  // Profile images
  profileImageMaxSize: 5 * 1024 * 1024, // 5MB
  allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  enableImageCompression: true,
  imageCompressionQuality: 0.8,
  
  // Contestant verification
  requireVerification: true,
  enableAutoVerification: false,
  verificationMethods: ['email', 'phone', 'document'],
  verificationExpiryDays: 90,
  
  // Contestant badges & achievements
  enableBadges: true,
  enableAchievements: true,
  enableLeaderboard: true,
  leaderboardUpdateFrequency: 60 * 60 * 1000, // 1 hour
  
  // Contestant sponsorships
  enableSponsors: true,
  minSponsorAmount: 100,
  maxSponsorsPerContestant: 50,
  
  // Contestant analytics
  enablePublicAnalytics: true,
  analyticsDataRetention: 365 * 24 * 60 * 60 * 1000, // 1 year
};

// ============================================================================
// PAYMENT & TRANSACTION SETTINGS
// ============================================================================

export const PAYMENT_CONFIG = {
  // Payment methods
  enabledPaymentMethods: ['credit_card', 'debit_card', 'paypal', 'stripe'],
  defaultPaymentMethod: 'credit_card',
  
  // Payment processing
  paymentProcessor: 'stripe', // 'stripe', 'paypal', 'square'
  enableRecurringPayments: true,
  enableSubscriptions: true,
  
  // Transaction limits
  minTransactionAmount: 0.50,
  maxTransactionAmount: 10000,
  maxTransactionsPerDay: 100,
  
  // Fee structure
  platformFeePercentage: 2.9, // 2.9% platform fee
  processingFeePercentage: 2.2, // 2.2% payment processor fee
  fixedFeePerTransaction: 0.30,
  enableDynamicPricing: false,
  
  // Tax & VAT
  enableTaxCalculation: true,
  enableVAT: true,
  defaultTaxRate: 0.0, // Country-specific
  
  // Refunds & chargebacks
  allowRefunds: true,
  refundWindow: 30 * 24 * 60 * 60 * 1000, // 30 days
  chargebackLimit: 3,
  enableAutoRefund: true,
  
  // Payment security
  enablePCI_DSS: true,
  enableTokenization: true,
  enableThreeDSecure: true,
  requireCVV: true,
};

// ============================================================================
// FRAUD DETECTION & SECURITY
// ============================================================================

export const FRAUD_CONFIG = {
  // Fraud detection methods
  enableFraudDetection: true,
  enableIPBlocking: true,
  enableDeviceFingerprinting: true,
  enableBehavioralAnalysis: true,
  enableMachineLearningSuspicion: true,
  
  // Risk scoring
  riskScoreThreshold: 0.75, // 75% risk = flag as suspicious
  highRiskActions: ['rapid_voting', 'suspicious_ip', 'velocity_abuse', 'payment_dispute'],
  
  // Automated responses
  enableAutoBlockHighRisk: false,
  enableAutoRefundSuspiciousTransactions: false,
  requireManualReviewForHighRisk: true,
  
  // IP & Device settings
  enableGeoIPChecking: true,
  enableVPNDetection: true,
  enableProxyDetection: true,
  allowVPNUsers: true,
  allowProxyUsers: false,
  
  // Rate limiting
  enableRateLimiting: true,
  requestsPerMinute: 60,
  votesPerMinute: 10,
  loginAttemptsPerMinute: 5,
  
  // Suspicious patterns
  allowPatternsForAnalysis: [
    'rapid_vote_bursts',
    'same_ip_multiple_accounts',
    'timing_anomalies',
    'geographic_impossibilities',
  ],
  
  // User blocking
  enableUserBlocking: true,
  maxViolationsBeforeBlock: 5,
  blockDuration: 24 * 60 * 60 * 1000, // 24 hours
};

// ============================================================================
// NOTIFICATION & COMMUNICATION SETTINGS
// ============================================================================

export const NOTIFICATION_CONFIG = {
  // Email settings
  enableEmailNotifications: true,
  emailProvider: 'sendgrid', // 'sendgrid', 'mailgun', 'aws_ses'
  defaultEmailSender: 'noreply@votingplatform.com',
  emailTemplatesPath: '/templates/emails/',
  
  // Email types
  enableWelcomeEmails: true,
  enableTransactionEmails: true,
  enableNotificationEmails: true,
  enableMarketingEmails: true,
  
  // SMS settings
  enableSMSNotifications: false,
  smsProvider: 'twilio', // 'twilio', 'aws_sns'
  smsRateLimit: 10, // per day per user
  
  // Push notifications
  enablePushNotifications: true,
  pushProvider: 'firebase', // 'firebase', 'aws_pinpoint'
  
  // In-app notifications
  enableInAppNotifications: true,
  notificationRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
  maxNotificationsPerUser: 100,
  
  // Notification frequency
  notificationQueueProcessing: 60 * 1000, // Process queue every 60 seconds
  batchNotifications: true,
  batchSize: 100,
  
  // Notification preferences
  allowUserPreferences: true,
  enableUnsubscribeLinks: true,
  allowNotificationScheduling: true,
};

// ============================================================================
// ANALYTICS & REPORTING SETTINGS
// ============================================================================

export const ANALYTICS_CONFIG = {
  // Data collection
  enableAnalytics: true,
  analyticsProvider: 'google_analytics', // 'google_analytics', 'mixpanel', 'amplitude'
  trackingCode: 'UA-XXXXXXXXX-X',
  
  // Event tracking
  trackUserActions: true,
  trackVoteEvents: true,
  trackPurchaseEvents: true,
  trackErrorEvents: true,
  
  // Data retention
  dataRetentionDays: 365,
  enableAutoDataDeletion: true,
  
  // Reporting
  enablePublicReports: true,
  reportGenerationFrequency: 'daily', // 'hourly', 'daily', 'weekly', 'monthly'
  enableCustomReports: true,
  maxCustomReportsPerUser: 10,
  
  // Dashboard metrics
  dashboardUpdateFrequency: 60 * 1000, // Update every minute
  enableRealTimeMetrics: true,
  enablePredictiveAnalytics: false,
};

// ============================================================================
// BLOCKCHAIN & VERIFICATION SETTINGS
// ============================================================================

export const BLOCKCHAIN_CONFIG = {
  // Blockchain settings
  enableBlockchain: true,
  blockchainNetwork: 'ethereum', // 'ethereum', 'polygon', 'binance'
  smartContractAddress: '0x0000000000000000000000000000000000000000',
  
  // Verification
  enableVoteVerification: true,
  enableTransactionVerification: true,
  verificationUpdateFrequency: 60 * 1000, // Update every minute
  
  // Gas optimization
  enableBatchTransactions: true,
  batchSize: 50,
  gasOptimization: 'aggressive', // 'conservative', 'moderate', 'aggressive'
  
  // Costs
  includeBlockchainCostsInVotingPrice: true,
  averageGasCostPerVote: 0.50,
};

// ============================================================================
// MEDIA & CONTENT SETTINGS
// ============================================================================

export const MEDIA_CONFIG = {
  // Media files
  allowedMediaTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
  maxMediaSize: 100 * 1024 * 1024, // 100MB
  enableMediaCompression: true,
  enableMediaCaching: true,
  
  // CDN settings
  enableCDN: true,
  cdnProvider: 'cloudflare', // 'cloudflare', 'aws_cloudfront', 'bunny'
  cdnUrl: 'https://cdn.votingplatform.com/',
  
  // Content moderation
  enableContentModeration: true,
  enableAutoModeration: true,
  enableManualModeration: true,
  
  // Media hosting
  mediaStorageProvider: 'aws_s3', // 'aws_s3', 'cloudinary', 'bunny_storage'
};

// ============================================================================
// UI & BRANDING SETTINGS
// ============================================================================

export const UI_CONFIG = {
  // Theme settings
  defaultTheme: 'dark', // 'light', 'dark', 'system'
  primaryColor: '#3b82f6', // Blue
  secondaryColor: '#8b5cf6', // Purple
  accentColor: '#ec4899', // Pink
  
  // Layout settings
  sidebarDefault: 'expanded', // 'expanded', 'collapsed'
  enableAnimations: true,
  animationSpeed: 'normal', // 'slow', 'normal', 'fast'
  
  // Branding
  appName: 'Voting Platform',
  appLogo: '/logo.png',
  appFavicon: '/favicon.ico',
  enableCustomBranding: false,
  
  // Pagination
  defaultPageSize: 20,
  allowablePageSizes: [10, 20, 50, 100],
  
  // Search settings
  enableSearch: true,
  searchDebounceMs: 300,
  maxSearchResults: 50,
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  // New features
  enableNewDashboard: true,
  enableAdvancedAnalytics: false,
  enableAIRecommendations: false,
  enableSocialSharing: true,
  enableReferralProgram: false,
  enableGamification: false,
  enableCommunityFeatures: false,
  enableCreatorTools: true,
  enableLiveStreaming: false,
  enableAugmentedReality: false,
  
  // Experimental features
  enableExperimentalUI: false,
  enableBetaFeatures: false,
  
  // Deprecated features
  enableLegacyInterface: false,
  enableOldReportingSystem: false,
};

// ============================================================================
// RATE LIMITING & QUOTAS
// ============================================================================

export const RATE_LIMITS = {
  // API rate limiting
  apiRequestsPerMinute: 60,
  apiRequestsPerHour: 3600,
  apiRequestsPerDay: 86400,
  
  // User quotas
  maxEventsPerUser: 50,
  maxContestantsPerEvent: 1000,
  maxVotesPerUser: 9999,
  
  // Upload quotas
  maxUploadsPerDay: 100,
  maxStoragePerUser: 5 * 1024 * 1024 * 1024, // 5GB
};

// ============================================================================
// LOGGING & DEBUGGING
// ============================================================================

export const LOGGING_CONFIG = {
  // Log levels
  enableLogging: true,
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  
  // Log destinations
  enableConsoleLogging: true,
  enableFileLogging: true,
  enableCloudLogging: true,
  
  // Cloud logging
  cloudLoggingProvider: 'google_cloud_logging',
  
  // Log retention
  logRetentionDays: 30,
  
  // Error tracking
  enableErrorTracking: true,
  errorTrackingProvider: 'sentry',
  sentryDSN: process.env.SENTRY_DSN || '',
  
  // Performance monitoring
  enablePerformanceMonitoring: true,
  performanceMonitoringProvider: 'datadog',
};

// ============================================================================
// EXPORT ALL CONFIGURATIONS
// ============================================================================

export const BACKEND_CONFIG = {
  AUTH_CONFIG,
  VOTING_CONFIG,
  EVENT_CONFIG,
  CONTESTANT_CONFIG,
  PAYMENT_CONFIG,
  FRAUD_CONFIG,
  NOTIFICATION_CONFIG,
  ANALYTICS_CONFIG,
  BLOCKCHAIN_CONFIG,
  MEDIA_CONFIG,
  UI_CONFIG,
  FEATURE_FLAGS,
  RATE_LIMITS,
  LOGGING_CONFIG,
  
  // Version and metadata
  apiVersion: 'v1',
  lastUpdated: new Date().toISOString(),
  
  // Helper function to get any config
  getConfig: (path: string) => {
    const keys = path.split('.');
    let value: any = BACKEND_CONFIG;
    for (const key of keys) {
      value = value[key];
      if (value === undefined) return null;
    }
    return value;
  },
  
  // Helper function to update config (frontend can call this)
  updateConfig: (path: string, newValue: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let obj: any = BACKEND_CONFIG;
    for (const key of keys) {
      if (!obj[key]) obj[key] = {};
      obj = obj[key];
    }
    obj[lastKey] = newValue;
    console.log(`[Backend Config] Updated ${path} to:`, newValue);
  },
};

export default BACKEND_CONFIG;
