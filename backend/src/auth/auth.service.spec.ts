import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserEntity, UserRole, UserStatus } from '@/entities/user.entity';
import { AuthOtpRequestEntity } from '@/entities/auth-otp-request.entity';
import { UserSessionEntity } from '@/entities/user-session.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { VoteWalletEntity } from '@/entities/vote-wallet.entity';
import { TenantEntity } from '@/entities/tenant.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { SponsorEntity } from '@/entities/sponsor.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';

jest.mock('argon2', () => ({
  hash: jest.fn(async () => 'mocked_hash'),
  verify: jest.fn(async () => true),
  argon2id: 2,
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: any;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser: UserEntity = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
    password_hash: '$2b$10$Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y', // Hashed 'password123'
    first_name: 'Test',
    last_name: 'User',
    phone_number: '+1234567890',
    tenant_id: null,
    google_id: null,
    role: UserRole.VOTER,
    status: UserStatus.ACTIVE,
    email_verified: true,
    email_verified_at: new Date(),
    phone_verified: true,
    phone_verified_at: new Date(),
    daily_vote_limit: 100,
    daily_spending_limit: 1000,
    bio: undefined,
    profile_image_url: null,
    two_factor_enabled: false,
    two_factor_method: undefined,
    last_login: new Date(),
    failed_login_attempts: 0,
    account_locked_until: null,
    refresh_token_hash: null,
    refresh_token_expires_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: new Date(),
    // Getters
    get phone(): string {
      return this.phone_number;
    },
    set phone(value: string) {
      this.phone_number = value;
    },
    get is_active(): boolean {
      return this.status === UserStatus.ACTIVE;
    },
    set is_active(value: boolean) {
      this.status = value ? UserStatus.ACTIVE : UserStatus.INACTIVE;
    },
    votes: [],
    contestants: [],
    devices: [],
    notifications: [],
    auditLogs: [],
    permissions: [],
    payments: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(async (value) => value),
          },
        },
        {
          provide: getRepositoryToken(AuthOtpRequestEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            increment: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              setLock: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
            }),
          },
        },
        {
          provide: getRepositoryToken(UserSessionEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn().mockResolvedValue([]),
            create: jest.fn((payload) => payload),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(VoteWalletEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            create: jest.fn((payload) => payload),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TenantEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id: 1 }),
          },
        },
        {
          provide: getRepositoryToken(ContestantEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SponsorEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload) => 'mock_token_' + payload.id),
            verify: jest.fn(() => ({ id: 1, email: 'test@example.com', role: 'voter' })),
            decode: jest.fn(() => ({ exp: Math.floor(Date.now() / 1000) + 3600 })),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              const config: any = {
                JWT_REFRESH_EXPIRATION: '7d',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(getRepositoryToken(UserEntity));
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User',
      };

      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue({ ...mockUser, ...registerDto });
      usersRepository.save.mockResolvedValue({ ...mockUser, ...registerDto });

      const result = await service.register(registerDto);

      expect(result.email).toBe(registerDto.email);
      expect(result.first_name).toBe(registerDto.first_name);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      };

      usersRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersRepository.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.access_token).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        relations: ['devices', 'notifications', 'permissions', 'payments'],
      });
    });

    it('should throw UnauthorizedException with invalid password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      usersRepository.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const inactiveUser = { ...mockUser, status: UserStatus.SUSPENDED };
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      usersRepository.findOne.mockResolvedValue(inactiveUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user if valid and active', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(1);

      expect(result.id).toBe(mockUser.id);
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['devices', 'notifications', 'permissions'],
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser(999)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      const suspendedUser = { ...mockUser, status: UserStatus.SUSPENDED };
      usersRepository.findOne.mockResolvedValue(suspendedUser);

      await expect(service.validateUser(1)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password hash', async () => {
      usersRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(result).not.toHaveProperty('password_hash');
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should generate new access token', async () => {
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      usersRepository.findOne.mockResolvedValue({
        ...mockUser,
        refresh_token_hash: 'stored-hash',
        refresh_token_expires_at: new Date(Date.now() + 3600_000),
      });

      const result = await service.refreshToken('mock_refresh_token');

      expect(result.access_token).toBeDefined();
      expect(result.access_token).toContain('mock_token_');
    });
  });
});
