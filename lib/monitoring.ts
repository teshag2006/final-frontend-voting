// Analytics and monitoring utilities
// These should be integrated with Vercel Analytics, Sentry, and custom tracking

export type EventType =
  | 'vote_submitted'
  | 'vote_cast_success'
  | 'vote_cast_error'
  | 'checkout_started'
  | 'checkout_completed'
  | 'checkout_failed'
  | 'payment_processed'
  | 'otp_attempt'
  | 'otp_success'
  | 'otp_failed'
  | 'otp_resend'
  | 'leaderboard_viewed'
  | 'event_viewed'
  | 'contestant_profile_viewed'
  | 'share_link_clicked'
  | 'fraud_flag_triggered'
  | 'account_suspended'
  | 'session_expired';

interface AnalyticsEvent {
  type: EventType;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

class AnalyticsManager {
  private sessionId: string;

  constructor() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = sessionStorage.getItem('analytics-session-id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics-session-id', sessionId);
    }
    return sessionId;
  }

  trackEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId'>) {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    // Send to Vercel Analytics
    if (typeof window !== 'undefined' && 'fetch' in window) {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsEvent),
      }).catch(() => {
        // Silently fail - don't interrupt user experience
      });
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', analyticsEvent);
    }
  }

  trackVoteSubmitted(contestantId: string, category: string, isPaid: boolean) {
    this.trackEvent({
      type: 'vote_submitted',
      metadata: { contestantId, category, isPaid },
    });
  }

  trackVoteSuccess(contestantId: string, category: string, receiptId: string) {
    this.trackEvent({
      type: 'vote_cast_success',
      metadata: { contestantId, category, receiptId },
    });
  }

  trackVoteError(error: string) {
    this.trackEvent({
      type: 'vote_cast_error',
      metadata: { error },
    });
  }

  trackCheckoutStarted(amount: number, currency: string) {
    this.trackEvent({
      type: 'checkout_started',
      metadata: { amount, currency },
    });
  }

  trackCheckoutCompleted(transactionId: string, amount: number) {
    this.trackEvent({
      type: 'checkout_completed',
      metadata: { transactionId, amount },
    });
  }

  trackCheckoutFailed(error: string) {
    this.trackEvent({
      type: 'checkout_failed',
      metadata: { error },
    });
  }

  trackOtpAttempt() {
    this.trackEvent({
      type: 'otp_attempt',
    });
  }

  trackOtpSuccess() {
    this.trackEvent({
      type: 'otp_success',
    });
  }

  trackOtpFailed() {
    this.trackEvent({
      type: 'otp_failed',
    });
  }

  trackLeaderboardViewed(eventSlug: string, category?: string) {
    this.trackEvent({
      type: 'leaderboard_viewed',
      metadata: { eventSlug, category },
    });
  }

  trackEventViewed(eventSlug: string) {
    this.trackEvent({
      type: 'event_viewed',
      metadata: { eventSlug },
    });
  }

  trackContestantViewed(contestantSlug: string, eventSlug: string) {
    this.trackEvent({
      type: 'contestant_profile_viewed',
      metadata: { contestantSlug, eventSlug },
    });
  }

  trackShareLink(type: string, contentId: string) {
    this.trackEvent({
      type: 'share_link_clicked',
      metadata: { type, contentId },
    });
  }

  trackFraudFlag(reason: string, severity: 'low' | 'medium' | 'high') {
    this.trackEvent({
      type: 'fraud_flag_triggered',
      metadata: { reason, severity },
    });
  }

  trackSessionExpired() {
    this.trackEvent({
      type: 'session_expired',
    });
  }
}

// Create singleton instance
export const analytics = new AnalyticsManager();

// Error tracking with Sentry
export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry initialization would go here
    // This is typically done in a separate client initialization file
  }
}

// Custom error tracking
export function logError(
  error: Error,
  context?: Record<string, any>
) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
  };

  // Send to error tracking service
  if (typeof window !== 'undefined') {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorData),
    }).catch(() => {
      // Silently fail
    });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', errorData);
  }
}

// Performance monitoring
export function trackWebVitals(metric: {
  name: string;
  value: number;
  label: string;
}) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Performance]', metric);
  }

  // Send to analytics
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'performance_metric',
      metric,
      timestamp: Date.now(),
    }),
  }).catch(() => {
    // Silently fail
  });
}
