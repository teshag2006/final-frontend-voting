'use client';

/**
 * Analytics Service - Track user behavior and system metrics
 * Sends events to backend analytics API
 */

export type EventCategory = 
  | 'user'
  | 'auth'
  | 'vote'
  | 'payment'
  | 'event'
  | 'page'
  | 'error'
  | 'performance';

export interface AnalyticsEvent {
  id: string;
  timestamp: number;
  category: EventCategory;
  action: string;
  label?: string;
  value?: number | string;
  userId?: string;
  sessionId?: string;
  userRole?: string;
  metadata?: Record<string, any>;
}

class AnalyticsService {
  private sessionId: string;
  private userId: string | null = null;
  private userRole: string | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private isEnabled = true;
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startBatchFlush();
  }

  /**
   * Initialize analytics with user info
   */
  init(userId: string, userRole: string): void {
    this.userId = userId;
    this.userRole = userRole;
  }

  /**
   * Track a user action
   */
  trackEvent(
    category: EventCategory,
    action: string,
    options?: {
      label?: string;
      value?: number | string;
      metadata?: Record<string, any>;
    }
  ): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      category,
      action,
      label: options?.label,
      value: options?.value,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      userRole: this.userRole || undefined,
      metadata: options?.metadata,
    };

    this.eventQueue.push(event);

    // Flush if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Track page view
   */
  trackPageView(pagePath: string, pageTitle?: string): void {
    this.trackEvent('page', 'view', {
      label: pagePath,
      metadata: {
        title: pageTitle,
        referrer: typeof document !== 'undefined' ? document.referrer : null,
      },
    });
  }

  /**
   * Track vote submission
   */
  trackVoteSubmitted(eventId: string, contestantId: string, amount?: number): void {
    this.trackEvent('vote', 'submitted', {
      label: eventId,
      value: amount,
      metadata: {
        eventId,
        contestantId,
      },
    });
  }

  /**
   * Track payment attempt
   */
  trackPaymentAttempt(eventId: string, amount: number, method: string): void {
    this.trackEvent('payment', 'attempt', {
      label: method,
      value: amount,
      metadata: {
        eventId,
      },
    });
  }

  /**
   * Track payment success
   */
  trackPaymentSuccess(transactionId: string, amount: number): void {
    this.trackEvent('payment', 'success', {
      label: transactionId,
      value: amount,
    });
  }

  /**
   * Track payment failure
   */
  trackPaymentFailure(reason: string, amount?: number): void {
    this.trackEvent('payment', 'failed', {
      label: reason,
      value: amount,
    });
  }

  /**
   * Track login
   */
  trackLogin(method: string, success: boolean): void {
    this.trackEvent('auth', 'login', {
      label: method,
      metadata: {
        success,
      },
    });
  }

  /**
   * Track logout
   */
  trackLogout(): void {
    this.trackEvent('auth', 'logout');
  }

  /**
   * Track error
   */
  trackError(errorMessage: string, errorCode?: string, context?: any): void {
    this.trackEvent('error', 'occurred', {
      label: errorCode || 'unknown',
      metadata: {
        message: errorMessage,
        context,
      },
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(metricName: string, duration: number): void {
    this.trackEvent('performance', metricName, {
      value: duration,
    });
  }

  /**
   * Track feature flag exposure
   */
  trackFeatureFlagExposure(flagKey: string, enabled: boolean): void {
    this.trackEvent('user', 'feature_flag_exposed', {
      label: flagKey,
      metadata: {
        enabled,
      },
    });
  }

  /**
   * Flush events to backend
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Send to backend analytics API
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events,
          sessionId: this.sessionId,
        }),
      });

      if (!response.ok) {
        console.error('[v0] Analytics flush failed:', response.statusText);
        // Re-queue events on failure
        this.eventQueue = [...events, ...this.eventQueue];
      }
    } catch (error) {
      console.error('[v0] Analytics error:', error);
      // Re-queue events on error
      this.eventQueue = [...events, ...this.eventQueue];
    }
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get pending event count
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Start automatic batch flush
   */
  private startBatchFlush(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  /**
   * Stop batch flush
   */
  stopBatchFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const analyticsService = new AnalyticsService();
