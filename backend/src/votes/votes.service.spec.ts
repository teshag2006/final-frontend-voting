import { Test, TestingModule } from '@nestjs/testing';
import { VotesService } from './votes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { VoteEntity, VoteStatus, VoteType, FraudRiskLevel } from '@/entities/vote.entity';
import { VoteReceiptEntity } from '@/entities/vote-receipt.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { EventEntity, EventStatus } from '@/entities/event.entity';
import { UserEntity } from '@/entities/user.entity';
import { DeviceEntity } from '@/entities/device.entity';
import { PaymentEntity } from '@/entities/payment.entity';
import { FraudDetectionService } from '@/fraud/services/fraud-detection.service';
import { DeviceFingerprintService } from '@/fraud/services/device-fingerprint.service';
import { DeviceReputationService } from '@/fraud/services/device-reputation.service';
import { AnomalyDetectionService } from '@/fraud/services/anomaly-detection.service';
import { VelocityCheckService } from '@/fraud/services/velocity-check.service';
import { VPNDetectionService } from '@/fraud/services/vpn-detection.service';
import { LeaderboardGateway } from '@/leaderboard/leaderboard.gateway';

describe('VotesService', () => {
  let service: VotesService;
  let votesRepository: any;
  let votesReceiptRepository: any;
  let contestantsRepository: any;
  let categoriesRepository: any;
  let eventsRepository: any;
  let fraudDetectionService: FraudDetectionService;
  let dataSource: DataSource;

  const mockEvent = {
    id: 1,
    name: 'Test Event',
    slug: 'test-event',
    description: 'Test event description',
    status: EventStatus.ACTIVE,
    season: 1,
    start_date: new Date(),
    end_date: new Date(),
    voting_start: new Date(),
    voting_end: new Date(Date.now() + 24 * 60 * 60 * 1000),
    timezone: 'UTC',
    country: 'US',
    city: 'New York',
    tenant_id: 1,
    creator_id: 1,
    creator: { id: 1, email: 'creator@test.com', username: 'creator', password_hash: 'hash', role: 'admin' as any, status: 'active' as any, tenant_id: null, first_name: 'Test', last_name: 'Creator', created_at: new Date(), updated_at: new Date() } as UserEntity,
    featured_image_url: null,
    banner_image_url: null,
    rules: 'Test rules',
    terms_conditions: 'Test terms',
    max_contestants: 100,
    min_age: 18,
    max_votes_per_user: null,
    max_daily_votes_per_user: null,
    daily_spending_cap: null,
    allow_international: false,
    verification_required: true,
    created_at: new Date(),
    updated_at: new Date(),
    categories: [{}] as CategoryEntity[],
    contestants: [{}] as ContestantEntity[],
    votes: [{}] as VoteEntity[],
    payments: [{}] as PaymentEntity[],
    batches: [{}] as any[],
  } as unknown as EventEntity;

  const mockCategory = {
    id: 1,
    event_id: 1,
    name: 'Test Category',
    description: 'Test category',
    category_order: 1,
    voting_enabled: true,
    public_voting: true,
    paid_voting: false,
    minimum_vote_amount: 0,
    accept_write_ins: true,
    daily_vote_limit: 10,
    max_votes_per_user: 100,
    created_at: new Date(),
    updated_at: new Date(),
    event: mockEvent,
    contestants: [{}] as ContestantEntity[],
    votes: [{}] as VoteEntity[],
  } as unknown as CategoryEntity;

  const mockContestant = {
    id: 1,
    event_id: 1,
    category_id: 1,
    first_name: 'Test',
    last_name: 'Contestant',
    email: 'contestant@example.com',
    phone_number: '+1234567890',
    date_of_birth: new Date('1990-01-01'),
    biography: 'Test bio',
    profile_image_url: 'https://example.com/image.jpg',
    banner_image_url: 'https://example.com/banner.jpg',
    status: 'approved' as any,
    verification_status: 'verified' as any,
    verified_at: new Date(),
    vote_count: 100,
    paid_vote_count: 50,
    free_vote_count: 50,
    total_revenue: 100.0,
    display_order: 1,
    is_featured: false,
    twitter_handle: '@contestant',
    instagram_handle: 'contestant',
    facebook_url: 'https://facebook.com/contestant',
    tiktok_handle: 'contestant',
    youtube_channel: 'https://youtube.com/contestant',
    website_url: 'https://contestant.com',
    linkedin_profile: 'https://linkedin.com/in/contestant',
    created_at: new Date(),
    updated_at: new Date(),
    event: mockEvent,
    category: mockCategory,
    votes: [{}] as VoteEntity[],
    payments: [{}] as PaymentEntity[],
    media: [{}] as any[],
  } as unknown as ContestantEntity;

  beforeEach(async () => {
    const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue(undefined),
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotesService,
        {
          provide: getRepositoryToken(VoteEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn().mockResolvedValue(0),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(VoteReceiptEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ContestantEntity),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(EventEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: FraudDetectionService,
          useValue: {
            calculateFraudScore: jest.fn().mockResolvedValue({
              score: 0.3,
              level: FraudRiskLevel.LOW,
              reasons: [],
            }),
            getVoteStatus: jest.fn((score) => VoteStatus.VALID),
          },
        },
        {
          provide: DeviceFingerprintService,
          useValue: {
            checkDevice: jest.fn().mockResolvedValue({ deviceId: 1, riskScore: 0 }),
            updateDeviceActivity: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: DeviceReputationService,
          useValue: {
            getReputation: jest.fn().mockResolvedValue({ trustScore: 1 }),
            updateReputation: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: AnomalyDetectionService,
          useValue: {
            checkAnomalies: jest.fn().mockResolvedValue({ hasAnomaly: false, riskScore: 0 }),
          },
        },
        {
          provide: VelocityCheckService,
          useValue: {
            checkVelocity: jest.fn().mockResolvedValue({ isAllowed: true, message: 'ok' }),
          },
        },
        {
          provide: VPNDetectionService,
          useValue: {
            detectVPN: jest.fn().mockResolvedValue({
              isVPNOrProxy: false,
              confidence: 0,
              threatLevel: 'low',
              country: 'US',
            }),
            shouldBlockVote: jest.fn().mockReturnValue(false),
            logDetection: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: LeaderboardGateway,
          useValue: {
            broadcastVoteUpdate: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<VotesService>(VotesService);
    votesRepository = module.get(getRepositoryToken(VoteEntity));
    votesReceiptRepository = module.get(getRepositoryToken(VoteReceiptEntity));
    contestantsRepository = module.get(getRepositoryToken(ContestantEntity));
    categoriesRepository = module.get(getRepositoryToken(CategoryEntity));
    eventsRepository = module.get(getRepositoryToken(EventEntity));
    fraudDetectionService = module.get<FraudDetectionService>(FraudDetectionService);
    dataSource = module.get<DataSource>(DataSource);
  });

  describe('castVote', () => {
    const createVoteDto = {
      eventId: 1,
      categoryId: 1,
      contestantId: 1,
      voteType: VoteType.FREE,
      deviceFingerprint: 'device-fingerprint',
      userAgent: 'Mozilla/5.0',
      ipAddress: '192.168.1.1',
    };

    it('should successfully cast a vote', async () => {
      eventsRepository.findOne.mockResolvedValue(mockEvent);
      categoriesRepository.findOne.mockResolvedValue(mockCategory);
      contestantsRepository.findOne.mockResolvedValue(mockContestant);

      const mockVote = {
        id: 1,
        event: mockEvent,
        event_id: 1,
        category: mockCategory,
        category_id: 1,
        contestant: mockContestant,
        contestant_id: 1,
        vote_type: VoteType.FREE,
        status: VoteStatus.VALID,
        fraud_risk_level: FraudRiskLevel.LOW,
        fraud_risk_score: 0.3,
        created_at: new Date(),
      };

      votesRepository.create.mockReturnValue(mockVote);
      const mockQueryRunner = dataSource.createQueryRunner() as any;
      mockQueryRunner.manager.save.mockResolvedValue(mockVote);

      const result = await service.castVote(1, createVoteDto);

      expect(result.id).toBe(1);
      expect(result.status).toBe(VoteStatus.VALID);
    });

    it('should throw BadRequestException if event not found', async () => {
      eventsRepository.findOne.mockResolvedValue(null);

      await expect(service.castVote(1, createVoteDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if category not found', async () => {
      eventsRepository.findOne.mockResolvedValue(mockEvent);
      categoriesRepository.findOne.mockResolvedValue(null);

      await expect(service.castVote(1, createVoteDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if contestant not found', async () => {
      eventsRepository.findOne.mockResolvedValue(mockEvent);
      categoriesRepository.findOne.mockResolvedValue(mockCategory);
      contestantsRepository.findOne.mockResolvedValue(null);

      await expect(service.castVote(1, createVoteDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getVoteById', () => {
    it('should return vote with all relations', async () => {
      const mockVote = {
        id: 1,
        event: mockEvent,
        event_id: 1,
        category: mockCategory,
        category_id: 1,
        contestant: mockContestant,
        contestant_id: 1,
        vote_type: VoteType.FREE,
        status: VoteStatus.VALID,
        fraud_risk_level: FraudRiskLevel.LOW,
        fraud_risk_score: 0.3,
        trust_score: 0.7,
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        voting_timestamp: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as VoteEntity;

      votesRepository.findOne.mockResolvedValue(mockVote);

      const result = await service.getVoteById(1);

      expect(result.id).toBe(1);
      expect(result.status).toBe(VoteStatus.VALID);
      expect(votesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [
          'event',
          'category',
          'contestant',
          'voter',
          'device',
          'payment',
          'receipts',
          'fraud_logs',
        ],
      });
    });

    it('should throw BadRequestException if vote not found', async () => {
      votesRepository.findOne.mockResolvedValue(null);

      await expect(service.getVoteById(999)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLeaderboard', () => {
    it('should return ranked contestants', async () => {
      const mockContestants = [
        { ...mockContestant, id: 1, vote_count: 500 },
        { ...mockContestant, id: 2, vote_count: 300 },
        { ...mockContestant, id: 3, vote_count: 100 },
      ];

      contestantsRepository.find.mockResolvedValue(mockContestants);

      const result = await service.getLeaderboard(1, 1, 100);

      expect(result).toHaveLength(3);
      expect(result[0].rank).toBe(1);
      expect(result[0].vote_count).toBe(500);
      expect(result[1].rank).toBe(2);
      expect(result[2].rank).toBe(3);
    });

    it('should limit results to specified limit', async () => {
      const mockContestants = Array(150)
        .fill(0)
        .map((_, i) => ({ ...mockContestant, id: i, vote_count: 500 - i }));

      contestantsRepository.find.mockResolvedValue(mockContestants.slice(0, 50));

      const result = await service.getLeaderboard(1, 1, 50);

      expect(result).toHaveLength(50);
      expect(contestantsRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        }),
      );
    });
  });

  describe('verifyVoteReceipt', () => {
    it('should return valid true if receipt found', async () => {
      const mockVote = {
        id: 1,
        event: mockEvent,
        event_id: 1,
        category: mockCategory,
        category_id: 1,
        contestant: mockContestant,
        contestant_id: 1,
        vote_type: VoteType.FREE,
        status: VoteStatus.VALID,
        fraud_risk_level: FraudRiskLevel.LOW,
        fraud_risk_score: 0.3,
        trust_score: 0.7,
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        voting_timestamp: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as VoteEntity;

      const mockReceipt = {
        id: 1,
        vote: mockVote,
        vote_id: 1,
        receipt_code: 'VOTE-123-ABC',
        receipt_hash: 'hash123',
        is_verified: true,
        verification_code: 'verify123',
        expires_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      votesReceiptRepository.findOne.mockResolvedValue(mockReceipt);

      const result = await service.verifyVoteReceipt('VOTE-123-ABC');

      expect(result.valid).toBe(true);
      expect(result.vote).toBe(mockVote);
    });

    it('should return valid false if receipt not found', async () => {
      votesReceiptRepository.findOne.mockResolvedValue(null);

      const result = await service.verifyVoteReceipt('INVALID-CODE');

      expect(result.valid).toBe(false);
      expect(result.vote).toBeUndefined();
    });
  });
});
