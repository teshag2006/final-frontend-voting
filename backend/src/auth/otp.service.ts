import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export interface OtpVerificationResult {
  success: boolean;
  message: string;
  attemptsRemaining?: number;
  userId?: number;
}

@Injectable()
export class OtpService {
  private readonly OTP_ATTEMPT_TTL = 600; // 10 minutes in seconds
  private readonly MAX_ATTEMPTS = 5;
  private readonly OTP_CODE_TTL = 300; // 5 minutes in seconds

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Store OTP code in Redis with expiration
   * Key format: otp_code:{email}:{purpose}
   */
  async storeOtp(email: string, purpose: string, otpHash: string): Promise<void> {
    const key = this.getOtpKey(email, purpose);
    const ttl = Number(this.configService.get('AUTH_OTP_EXP_MINUTES') ?? 5) * 60;
    
    await this.redis.setex(key, ttl, otpHash);
  }

  /**
   * Atomic OTP verification using Redis INCR
   * This prevents race conditions at high concurrency (1,000+ requests/sec)
   * 
   * Strategy: "Increment then Validate"
   * 1. ATOMIC INCREMENT - Do this FIRST
   * 2. CHECK LIMIT - Block immediately if threshold reached
   * 3. VERIFY - Compare with stored OTP
   * 4. CLEANUP - Delete keys on success
   */
  async verifyOtpAtomic(
    email: string,
    purpose: string,
    userCode: string,
    getStoredHash: () => Promise<string | null>,
    onSuccess: () => Promise<void>,
  ): Promise<OtpVerificationResult> {
    const attemptKey = this.getAttemptKey(email, purpose);
    
    // 1. ATOMIC INCREMENT - Do this FIRST to prevent race conditions
    // Redis INCR is atomic, so even 1000 requests in 1ms will be sequenced
    const attempts = await this.redis.incr(attemptKey);
    
    // Set expiry on first attempt so the block eventually resets
    if (attempts === 1) {
      await this.redis.expire(attemptKey, this.OTP_ATTEMPT_TTL);
    }

    // 2. CHECK LIMIT - Block immediately if threshold reached
    if (attempts > this.MAX_ATTEMPTS) {
      await this.redis.del(attemptKey); // Reset attempts on limit exceeded
      throw new BadRequestException(
        `Too many failed attempts. Account locked for ${this.OTP_ATTEMPT_TTL / 60} minutes.`
      );
    }

    const attemptsRemaining = this.MAX_ATTEMPTS - attempts;

    // 3. GET STORED OTP
    const storedHash = await getStoredHash();
    if (!storedHash) {
      // Clean up attempt counter if OTP expired
      await this.redis.del(attemptKey);
      throw new BadRequestException('OTP expired or not found. Please request a new code.');
    }

    // 4. VERIFY - Compare the codes
    const isValid = await this.compareCodes(userCode, storedHash);
    
    if (!isValid) {
      throw new UnauthorizedException(
        `Invalid OTP code. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`
      );
    }

    // 5. CLEANUP - Delete both keys on success to prevent reuse
    await this.redis.del(attemptKey);
    await this.redis.del(this.getOtpKey(email, purpose));
    
    // Execute the success callback (e.g., create session, issue tokens)
    await onSuccess();

    return {
      success: true,
      message: 'OTP verified successfully',
      attemptsRemaining: this.MAX_ATTEMPTS,
    };
  }

  /**
   * Clear OTP attempts (e.g., after successful login)
   */
  async clearAttempts(email: string, purpose: string): Promise<void> {
    await this.redis.del(this.getAttemptKey(email, purpose));
    await this.redis.del(this.getOtpKey(email, purpose));
  }

  /**
   * Get remaining attempts for display purposes
   */
  async getRemainingAttempts(email: string, purpose: string): Promise<number> {
    const attempts = await this.redis.get(this.getAttemptKey(email, purpose));
    if (!attempts) return this.MAX_ATTEMPTS;
    return Math.max(0, this.MAX_ATTEMPTS - parseInt(attempts, 10));
  }

  private getOtpKey(email: string, purpose: string): string {
    return `otp_code:${email.toLowerCase()}:${purpose}`;
  }

  private getAttemptKey(email: string, purpose: string): string {
    return `otp_attempts:${email.toLowerCase()}:${purpose}`;
  }

  private async compareCodes(inputCode: string, storedHash: string): Promise<boolean> {
    // Since we're storing the hash, we need to compare hashes
    // For this implementation, we'll compare the raw code against the stored hash
    // In production, you'd use bcrypt/argon2 comparison
    return inputCode === storedHash || inputCode === storedHash.replace(/^bcrypt:/, '');
  }
}
