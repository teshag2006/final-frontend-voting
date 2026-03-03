import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { UserEntity, UserStatus, UserRole } from '@/entities/user.entity';
import { AuthOtpRequestEntity } from '@/entities/auth-otp-request.entity';
import { UserSessionEntity } from '@/entities/user-session.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { VoteWalletEntity } from '@/entities/vote-wallet.entity';
import { TenantEntity } from '@/entities/tenant.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { SponsorEntity } from '@/entities/sponsor.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LogoutDto } from './dto/logout.dto';
import {
  AdminImpersonateDto,
  AdminImpersonateTargetType,
} from './dto/admin-impersonate.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(AuthOtpRequestEntity)
    private otpRequestsRepository: Repository<AuthOtpRequestEntity>,
    @InjectRepository(UserSessionEntity)
    private userSessionsRepository: Repository<UserSessionEntity>,
    @InjectRepository(CategoryEntity)
    private categoriesRepository: Repository<CategoryEntity>,
    @InjectRepository(VoteWalletEntity)
    private voteWalletRepository: Repository<VoteWalletEntity>,
    @InjectRepository(TenantEntity)
    private tenantsRepository: Repository<TenantEntity>,
    @InjectRepository(ContestantEntity)
    private contestantsRepository: Repository<ContestantEntity>,
    @InjectRepository(SponsorEntity)
    private sponsorsRepository: Repository<SponsorEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async requestOtp(requestOtpDto: RequestOtpDto) {
    const email = requestOtpDto.email.trim().toLowerCase();
    const purpose = requestOtpDto.purpose?.trim() || 'login';
    const otp = this.generateOtpCode();
    const otpHash = await this.hashSecret(otp);
    const expiresMinutes = Number(this.configService.get('AUTH_OTP_EXP_MINUTES') ?? 5);
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    const record = this.otpRequestsRepository.create({
      email,
      purpose,
      code_hash: otpHash,
      expires_at: expiresAt,
      attempts: 0,
    });
    await this.otpRequestsRepository.save(record);

    await this.dispatchOtp(email, purpose, otp, expiresAt);

    const payload: Record<string, any> = {
      delivery: 'email',
      email,
      purpose,
      expires_at: expiresAt,
    };

    // Development convenience only.
    if (String(this.configService.get('NODE_ENV') || 'development') !== 'production') {
      payload.otp = otp;
    }

    return payload;
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const email = verifyOtpDto.email.trim().toLowerCase();
    const purpose = verifyOtpDto.purpose?.trim() || 'login';
    const now = new Date();

    // Use pessimistic locking to prevent race conditions
    // This ensures atomic check-and-update of attempt count
    const otpRequest = await this.otpRequestsRepository
      .createQueryBuilder('otp')
      .setLock('pessimistic_write')
      .where('otp.email = :email', { email })
      .andWhere('otp.purpose = :purpose', { purpose })
      .andWhere('otp.consumed_at IS NULL')
      .orderBy('otp.created_at', 'DESC')
      .getOne();

    if (!otpRequest || otpRequest.expires_at <= now) {
      throw new UnauthorizedException('OTP expired or not found');
    }

    // Check attempt limit BEFORE attempting verification (atomic)
    if (otpRequest.attempts >= 5) {
      throw new UnauthorizedException('OTP attempt limit exceeded');
    }

    const matches = await this.verifySecret(otpRequest.code_hash, verifyOtpDto.code);
    
    // Use atomic increment to prevent race conditions
    // Increment first, then check if valid - this prevents parallel brute force
    await this.otpRequestsRepository.increment(
      { email, purpose, consumed_at: IsNull() },
      'attempts',
      1,
    );
    
    if (!matches) {
      // Re-fetch to get the updated attempt count
      const updatedOtp = await this.otpRequestsRepository.findOne({
        where: { id: otpRequest.id },
      });
      
      if (updatedOtp && updatedOtp.attempts >= 5) {
        throw new UnauthorizedException('OTP attempt limit exceeded');
      }
      throw new UnauthorizedException('Invalid OTP');
    }

    // Mark as consumed atomically
    otpRequest.consumed_at = now;
    await this.otpRequestsRepository.save(otpRequest);

    let user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      const username = await this.generateUniqueUsername(email);
      const randomPassword = await this.hashSecret(`otp-${email}-${Date.now()}`);
      const defaultTenantId = await this.resolveDefaultTenantId();
      user = this.usersRepository.create({
        email,
        username,
        tenant_id: defaultTenantId,
        password_hash: randomPassword,
        role: UserRole.VOTER,
        status: UserStatus.ACTIVE,
        email_verified: true,
        email_verified_at: now,
      });
    }

    user.last_login = now;
    user.failed_login_attempts = 0;
    user.account_locked_until = null;

    const persistedUser = await this.usersRepository.save(user);
    if (!persistedUser.tenant_id) {
      persistedUser.tenant_id = await this.resolveDefaultTenantId();
    }

    const payload: JwtPayload = {
      id: persistedUser.id,
      email: persistedUser.email,
      role: persistedUser.role,
      tenant_id: persistedUser.tenant_id ?? undefined,
    };

    const tokens = await this.issueAndPersistTokens(persistedUser, payload);
    const savedUser = await this.usersRepository.save(persistedUser);

    await this.upsertUserSession(savedUser.id, {
      refreshToken: tokens.refreshToken,
      deviceFingerprint: verifyOtpDto.device_fingerprint || 'unknown',
      ipAddress: verifyOtpDto.ip_address || null,
      userAgent: verifyOtpDto.user_agent || null,
      expiresAt: savedUser.refresh_token_expires_at ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await this.bootstrapWalletsForUser(savedUser.id);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
      },
      message: 'OTP verified successfully',
    };
  }

  async logout(userId: number, logoutDto: LogoutDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.refresh_token_hash = null;
    user.refresh_token_expires_at = null;
    await this.usersRepository.save(user);

    const sessions = await this.userSessionsRepository.find({
      where: { user_id: userId, revoked: false },
    });

    if (logoutDto.refresh_token) {
      for (const session of sessions) {
        const match = await this.verifySecret(session.refresh_token_hash, logoutDto.refresh_token);
        if (match) {
          session.revoked = true;
          await this.userSessionsRepository.save(session);
        }
      }
    } else if (logoutDto.device_fingerprint) {
      for (const session of sessions) {
        if (session.device_fingerprint === logoutDto.device_fingerprint) {
          session.revoked = true;
          await this.userSessionsRepository.save(session);
        }
      }
    } else {
      for (const session of sessions) {
        session.revoked = true;
      }
      if (sessions.length > 0) {
        await this.userSessionsRepository.save(sessions);
      }
    }

    return { message: 'Logged out successfully' };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, first_name, last_name } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const password_hash = await this.hashSecret(password);

    // Create new user
    const username = await this.generateUniqueUsername(email);
    const user = this.usersRepository.create({
      email,
      username,
      tenant_id: await this.resolveDefaultTenantId(),
      password_hash,
      first_name,
      last_name,
      role: UserRole.VOTER,
      status: UserStatus.ACTIVE,
    });

    await this.usersRepository.save(user);
    await this.createTokenRecord(user.email, 'email_confirmation', 24 * 60);

    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      message: 'Registration successful. Please log in.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const maxAttempts = Number(this.configService.get('AUTH_MAX_LOGIN_ATTEMPTS') ?? 5);
    const lockMinutes = Number(this.configService.get('AUTH_LOCK_MINUTES') ?? 15);
    const now = new Date();

    // Find user by email with relations
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['devices', 'notifications', 'permissions', 'payments'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.account_locked_until && user.account_locked_until > now) {
      throw new UnauthorizedException('Account temporarily locked. Try again later.');
    }

    // Verify password (Argon2id only).
    const isPasswordValid = await this.verifySecret(user.password_hash, password);
    if (!isPasswordValid) {
      await this.recordFailedLogin(user, maxAttempts, lockMinutes);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is inactive or suspended');
    }

    // Update login state
    user.last_login = new Date();
    user.failed_login_attempts = 0;
    user.account_locked_until = null;

    if (!user.tenant_id) {
      user.tenant_id = await this.resolveDefaultTenantId();
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id ?? undefined,
    };
    const tokens = await this.issueAndPersistTokens(user, payload);
    await this.usersRepository.save(user);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      message: 'Login successful',
    };
  }

  async validateUser(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['devices', 'notifications', 'permissions'],
    });
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  async refreshToken(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.validateUser(payload.id);
    if (
      !user.refresh_token_hash ||
      !user.refresh_token_expires_at ||
      user.refresh_token_expires_at <= new Date()
    ) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const tokenMatches = await this.verifySecret(user.refresh_token_hash, refreshToken);
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const activeSessions = await this.userSessionsRepository.find({
      where: { user_id: user.id, revoked: false },
    });
    if (activeSessions.length > 0) {
      let matchedSession = false;
      for (const session of activeSessions) {
        if (await this.verifySecret(session.refresh_token_hash, refreshToken)) {
          if (session.expires_at <= new Date()) {
            throw new UnauthorizedException('Refresh session expired');
          }
          matchedSession = true;
          break;
        }
      }
      if (!matchedSession) {
        throw new UnauthorizedException('Refresh session not found');
      }
    }

    if (!user.tenant_id) {
      user.tenant_id = await this.resolveDefaultTenantId();
    }

    const newPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id ?? undefined,
    };
    const tokens = await this.issueAndPersistTokens(user, newPayload);
    const savedUser = await this.usersRepository.save(user);
    await this.upsertUserSession(savedUser.id, {
      refreshToken: tokens.refreshToken,
      deviceFingerprint: 'rotated',
      ipAddress: null,
      userAgent: null,
      expiresAt: savedUser.refresh_token_expires_at ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      message: 'Token rotated successfully',
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['devices', 'notifications', 'permissions', 'votes', 'payments'],
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const validCurrent = await this.verifySecret(
      user.password_hash,
      currentPassword,
    );
    if (!validCurrent) {
      throw new UnauthorizedException('Current password is invalid');
    }

    user.password_hash = await this.hashSecret(newPassword);
    user.failed_login_attempts = 0;
    user.account_locked_until = null;
    user.refresh_token_hash = null;
    user.refresh_token_expires_at = null;
    await this.usersRepository.save(user);
  }

  async adminImpersonate(
    requester: UserEntity,
    payload: AdminImpersonateDto,
  ): Promise<{
    access_token: string;
    refresh_token: string;
    user: {
      id: number;
      email: string;
      role: UserRole;
      full_name: string;
      avatar_url?: string | null;
    };
    target: { type: AdminImpersonateTargetType; id: number };
  }> {
    if (requester.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Admin role required for impersonation');
    }

    let targetUser: UserEntity | null = null;

    if (payload.target_type === AdminImpersonateTargetType.CONTESTANT) {
      const contestant = await this.contestantsRepository.findOne({
        where: { id: payload.target_id },
        relations: ['user'],
      });
      if (!contestant) {
        throw new BadRequestException('Contestant not found');
      }
      if (!contestant.user_id || !contestant.user) {
        throw new BadRequestException(
          'Contestant is not linked to an auth user account',
        );
      }
      targetUser = contestant.user;
      if (targetUser.role !== UserRole.CONTESTANT) {
        throw new BadRequestException(
          'Linked user does not have contestant role',
        );
      }
    } else {
      const sponsor = await this.sponsorsRepository.findOne({
        where: { id: payload.target_id },
      });
      if (!sponsor) {
        throw new BadRequestException('Sponsor not found');
      }

      if (sponsor.contact_email) {
        targetUser = await this.usersRepository.findOne({
          where: { email: sponsor.contact_email.trim().toLowerCase() },
        });
      }

      // Fallback: keep behavior usable when sponsor is not linked to a user row.
      if (!targetUser) {
        targetUser = requester;
      }
    }

    if (!targetUser || targetUser.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Target user is inactive or unavailable');
    }

    if (!targetUser.tenant_id) {
      targetUser.tenant_id = await this.resolveDefaultTenantId();
    }

    const jwtPayload: JwtPayload = {
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      tenant_id: targetUser.tenant_id ?? undefined,
    };

    const tokens = await this.issueAndPersistTokens(targetUser, jwtPayload);
    const savedUser = await this.usersRepository.save(targetUser);
    await this.upsertUserSession(savedUser.id, {
      refreshToken: tokens.refreshToken,
      deviceFingerprint: `impersonation:${payload.target_type}:${payload.target_id}`,
      ipAddress: null,
      userAgent: null,
      expiresAt:
        savedUser.refresh_token_expires_at ??
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        full_name: `${savedUser.first_name || ''} ${savedUser.last_name || ''}`.trim() ||
          savedUser.email,
        avatar_url: savedUser.profile_image_url,
      },
      target: { type: payload.target_type, id: payload.target_id },
    };
  }

  async forgotPassword(email: string): Promise<void> {
    if (!email) return;
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) return;
    await this.createTokenRecord(email, 'password_reset', 30);
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    if (!email || !token || !newPassword) {
      throw new BadRequestException('email, token, and newPassword are required');
    }
    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const record = await this.consumeTokenRecord(email, 'password_reset', token);
    if (!record) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    user.password_hash = await this.hashSecret(newPassword);
    user.failed_login_attempts = 0;
    user.account_locked_until = null;
    await this.usersRepository.save(user);
  }

  async confirmEmail(token: string): Promise<string> {
    if (!token) {
      throw new BadRequestException('token is required');
    }

    const candidates = await this.otpRequestsRepository.find({
      where: { purpose: 'email_confirmation', consumed_at: IsNull() },
      order: { created_at: 'DESC' },
      take: 100,
    });

    const now = new Date();
    let matched: AuthOtpRequestEntity | null = null;
    for (const record of candidates) {
      if (record.expires_at <= now) continue;
      const ok = await this.verifySecret(record.code_hash, token);
      if (ok) {
        matched = record;
        break;
      }
    }

    if (!matched) {
      throw new UnauthorizedException('Invalid or expired confirmation link');
    }

    matched.consumed_at = now;
    await this.otpRequestsRepository.save(matched);

    const user = await this.usersRepository.findOne({ where: { email: matched.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid or expired confirmation link');
    }

    user.email_verified = true;
    user.email_verified_at = now;
    await this.usersRepository.save(user);
    return user.email;
  }

  private async issueAndPersistTokens(user: UserEntity, payload: JwtPayload): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
    });

    const decoded = this.jwtService.decode(refreshToken) as { exp?: number } | null;
    const refreshExpiresAt = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refresh_token_hash = await this.hashSecret(refreshToken);
    user.refresh_token_expires_at = refreshExpiresAt;
    return { accessToken, refreshToken };
  }

  private async recordFailedLogin(
    user: UserEntity,
    maxAttempts: number,
    lockMinutes: number,
  ): Promise<void> {
    const attempts = (user.failed_login_attempts ?? 0) + 1;
    user.failed_login_attempts = attempts;

    if (attempts >= maxAttempts) {
      user.account_locked_until = new Date(Date.now() + lockMinutes * 60 * 1000);
      user.failed_login_attempts = 0;
    }

    await this.usersRepository.save(user);
  }

  private async generateUniqueUsername(email: string): Promise<string> {
    const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 24) || 'user';
    let candidate = base;
    let suffix = 0;

    while (await this.usersRepository.findOne({ where: { username: candidate } })) {
      suffix += 1;
      candidate = `${base}_${suffix}`.slice(0, 32);
    }

    return candidate;
  }

  private async resolveDefaultTenantId(): Promise<number> {
    const defaultTenant = await this.tenantsRepository.findOne({
      where: { slug: 'default-tenant' },
      select: ['id'],
    });
    if (defaultTenant) {
      return defaultTenant.id;
    }

    const fallbackTenant = await this.tenantsRepository.findOne({
      order: { id: 'ASC' },
      select: ['id'],
    });
    if (fallbackTenant) {
      return fallbackTenant.id;
    }

    throw new UnauthorizedException('No tenant available. Run tenant migrations first.');
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  private async createTokenRecord(
    email: string,
    purpose: string,
    expiresInMinutes: number,
  ): Promise<string> {
    const token = this.generateSecureToken();
    const tokenHash = await this.hashSecret(token);
    const expires_at = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    const record = this.otpRequestsRepository.create({
      email,
      purpose,
      code_hash: tokenHash,
      expires_at,
      attempts: 0,
    });
    await this.otpRequestsRepository.save(record);
    return token;
  }

  private async consumeTokenRecord(
    email: string,
    purpose: string,
    token: string,
  ): Promise<AuthOtpRequestEntity | null> {
    const now = new Date();
    const records = await this.otpRequestsRepository.find({
      where: { email, purpose, consumed_at: IsNull() },
      order: { created_at: 'DESC' },
      take: 25,
    });

    for (const record of records) {
      if (record.expires_at <= now) continue;
      if (record.attempts >= 5) continue;

      await this.otpRequestsRepository.increment({ id: record.id }, 'attempts', 1);
      const valid = await this.verifySecret(record.code_hash, token);
      if (!valid) continue;

      record.consumed_at = now;
      await this.otpRequestsRepository.save(record);
      return record;
    }

    return null;
  }

  private async upsertUserSession(
    userId: number,
    params: {
      refreshToken: string;
      deviceFingerprint: string;
      ipAddress: string | null;
      userAgent: string | null;
      expiresAt: Date;
    },
  ): Promise<void> {
    const tokenHash = await this.hashSecret(params.refreshToken);

    let session = await this.userSessionsRepository.findOne({
      where: {
        user_id: userId,
        device_fingerprint: params.deviceFingerprint,
        revoked: false,
      },
      order: { created_at: 'DESC' },
    });

    if (!session) {
      session = this.userSessionsRepository.create({
        user_id: userId,
        device_fingerprint: params.deviceFingerprint,
        refresh_token_hash: tokenHash,
        ip_address: params.ipAddress,
        user_agent: params.userAgent,
        expires_at: params.expiresAt,
        revoked: false,
      });
    } else {
      session.refresh_token_hash = tokenHash;
      session.ip_address = params.ipAddress;
      session.user_agent = params.userAgent;
      session.expires_at = params.expiresAt;
      session.revoked = false;
    }

    await this.userSessionsRepository.save(session);
  }

  private async bootstrapWalletsForUser(userId: number): Promise<void> {
    const categories = await this.categoriesRepository.find({
      select: ['id', 'event_id'],
    });

    if (categories.length === 0) return;

    const existing = await this.voteWalletRepository.find({
      where: { user_id: userId },
      select: ['id', 'event_id', 'category_id'],
    });

    const existingKeys = new Set(existing.map((w) => `${w.event_id}:${w.category_id}`));
    const missing = categories
      .filter((c) => !existingKeys.has(`${c.event_id}:${c.id}`))
      .map((c) =>
        this.voteWalletRepository.create({
          user_id: userId,
          event_id: c.event_id,
          category_id: c.id,
        }),
      );

    if (missing.length > 0) {
      await this.voteWalletRepository.save(missing);
    }
  }

  private async hashSecret(secret: string): Promise<string> {
    return argon2.hash(secret, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  }

  private async verifySecret(hash: string, secret: string): Promise<boolean> {
    return argon2.verify(hash, secret);
  }

  private async dispatchOtp(
    email: string,
    purpose: string,
    otp: string,
    expiresAt: Date,
  ): Promise<void> {
    const webhookUrl = String(this.configService.get('AUTH_OTP_WEBHOOK_URL') || '').trim();
    const sender = String(
      this.configService.get('AUTH_OTP_FROM_EMAIL') ||
        this.configService.get('SMTP_FROM') ||
        this.configService.get('SES_FROM_EMAIL') ||
        '',
    ).trim();
    const isProduction =
      String(this.configService.get('NODE_ENV') || '').toLowerCase() === 'production';

    if (!webhookUrl) {
      if (isProduction) {
        throw new ServiceUnavailableException(
          'OTP delivery is not configured. Set AUTH_OTP_WEBHOOK_URL.',
        );
      }
      this.logger.warn(
        'AUTH_OTP_WEBHOOK_URL is not configured; OTP dispatch skipped outside production',
      );
      return;
    }

    try {
      await axios.post(
        webhookUrl,
        {
          channel: 'email',
          to: email,
          from: sender || undefined,
          purpose,
          otp,
          expires_at: expiresAt.toISOString(),
        },
        { timeout: 8000 },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`OTP dispatch failed: ${message}`);
      throw new ServiceUnavailableException('Failed to deliver OTP');
    }
  }
}
