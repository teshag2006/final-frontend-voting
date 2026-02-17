/**
 * OTP Service with Rate Limiting and Replay Protection
 * Handles OTP generation, validation, and security
 */

export interface OtpConfig {
  expiryTime: number; // milliseconds
  maxAttempts: number;
  resendCooldown: number; // milliseconds
}

interface OtpRecord {
  code: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

interface RateLimitRecord {
  email: string;
  lastRequestTime: number;
  requestCount: number;
}

class OtpService {
  private otpStore = new Map<string, OtpRecord>();
  private rateLimitStore = new Map<string, RateLimitRecord>();
  private readonly config: OtpConfig = {
    expiryTime: 10 * 60 * 1000, // 10 minutes
    maxAttempts: 5,
    resendCooldown: 30 * 1000, // 30 seconds
  };

  /**
   * Generate OTP
   */
  generateOtp(email: string): { code: string; expiresIn: number } | { error: string } {
    // Check rate limiting
    const rateLimitCheck = this.checkRateLimit(email);
    if (!rateLimitCheck.allowed) {
      return {
        error: `Too many requests. Please wait ${Math.ceil(rateLimitCheck.waitTime / 1000)} seconds before trying again.`,
      };
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();

    const otpRecord: OtpRecord = {
      code,
      email,
      createdAt: now,
      expiresAt: now + this.config.expiryTime,
      attempts: 0,
      verified: false,
    };

    // Store OTP
    const otpKey = this.getOtpKey(email);
    this.otpStore.set(otpKey, otpRecord);

    // Update rate limit
    this.updateRateLimit(email);

    return {
      code,
      expiresIn: this.config.expiryTime,
    };
  }

  /**
   * Verify OTP
   */
  verifyOtp(email: string, code: string): { success: boolean; error?: string } {
    const otpKey = this.getOtpKey(email);
    const record = this.otpStore.get(otpKey);

    // OTP not found
    if (!record) {
      return { success: false, error: 'OTP not found or expired' };
    }

    // OTP already verified (replay protection)
    if (record.verified) {
      return { success: false, error: 'OTP already used' };
    }

    // OTP expired
    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(otpKey);
      return { success: false, error: 'OTP expired' };
    }

    // Max attempts exceeded
    if (record.attempts >= this.config.maxAttempts) {
      this.otpStore.delete(otpKey);
      return { success: false, error: 'Maximum verification attempts exceeded' };
    }

    // Code mismatch
    if (record.code !== code) {
      record.attempts += 1;
      return { success: false, error: 'Invalid OTP' };
    }

    // OTP verified - mark as used (replay protection)
    record.verified = true;

    // Clean up after verification
    setTimeout(() => {
      this.otpStore.delete(otpKey);
    }, 1000);

    return { success: true };
  }

  /**
   * Check if resend is allowed (cooldown)
   */
  canResendOtp(email: string): { allowed: boolean; waitTime: number } {
    const rateLimitRecord = this.rateLimitStore.get(email);

    if (!rateLimitRecord) {
      return { allowed: true, waitTime: 0 };
    }

    const timeSinceLastRequest = Date.now() - rateLimitRecord.lastRequestTime;
    const canResend = timeSinceLastRequest >= this.config.resendCooldown;

    return {
      allowed: canResend,
      waitTime: canResend ? 0 : this.config.resendCooldown - timeSinceLastRequest,
    };
  }

  /**
   * Clear OTP for email
   */
  clearOtp(email: string): void {
    const otpKey = this.getOtpKey(email);
    this.otpStore.delete(otpKey);
  }

  /**
   * Get remaining time for OTP
   */
  getRemainingTime(email: string): number {
    const otpKey = this.getOtpKey(email);
    const record = this.otpStore.get(otpKey);

    if (!record) return 0;

    const remaining = record.expiresAt - Date.now();
    return Math.max(0, remaining);
  }

  // ============ Private Helper Methods ============

  /**
   * Check rate limiting for OTP generation
   */
  private checkRateLimit(email: string): { allowed: boolean; waitTime: number } {
    const record = this.rateLimitStore.get(email);
    const now = Date.now();

    if (!record) {
      return { allowed: true, waitTime: 0 };
    }

    // Reset counter if cooldown expired
    if (now - record.lastRequestTime > this.config.resendCooldown) {
      record.requestCount = 0;
      return { allowed: true, waitTime: 0 };
    }

    // Check if exceeded limit (max 3 requests per cooldown period)
    if (record.requestCount >= 3) {
      const waitTime = this.config.resendCooldown - (now - record.lastRequestTime);
      return { allowed: false, waitTime };
    }

    return { allowed: true, waitTime: 0 };
  }

  /**
   * Update rate limit tracking
   */
  private updateRateLimit(email: string): void {
    const now = Date.now();
    const record = this.rateLimitStore.get(email);

    if (!record) {
      this.rateLimitStore.set(email, {
        email,
        lastRequestTime: now,
        requestCount: 1,
      });
    } else {
      record.lastRequestTime = now;
      record.requestCount += 1;
    }
  }

  /**
   * Generate OTP storage key
   */
  private getOtpKey(email: string): string {
    return `otp:${email}`;
  }
}

// Export singleton instance
export const otpService = new OtpService();
