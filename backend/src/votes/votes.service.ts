import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeepPartial, In, MoreThan } from 'typeorm';
import { VoteEntity, VoteStatus, VoteType, FraudRiskLevel } from '@/entities/vote.entity';
import { VoteReceiptEntity } from '@/entities/vote-receipt.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { EventEntity, EventStatus } from '@/entities/event.entity';
import { UserEntity } from '@/entities/user.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { FraudDetectionService } from '@/fraud/services/fraud-detection.service';
import { DeviceFingerprintService } from '@/fraud/services/device-fingerprint.service';
import { DeviceReputationService } from '@/fraud/services/device-reputation.service';
import { AnomalyDetectionService } from '@/fraud/services/anomaly-detection.service';
import { VelocityCheckService } from '@/fraud/services/velocity-check.service';
import { VPNDetectionService } from '@/fraud/services/vpn-detection.service';
import { LeaderboardGateway } from '@/leaderboard/leaderboard.gateway';
import * as crypto from 'crypto';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(VoteEntity)
    private votesRepository: Repository<VoteEntity>,
    @InjectRepository(VoteReceiptEntity)
    private votesReceiptRepository: Repository<VoteReceiptEntity>,
    @InjectRepository(ContestantEntity)
    private contestantsRepository: Repository<ContestantEntity>,
    @InjectRepository(CategoryEntity)
    private categoriesRepository: Repository<CategoryEntity>,
    @InjectRepository(EventEntity)
    private eventsRepository: Repository<EventEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    // Fraud detection services
    private fraudDetectionService: FraudDetectionService,
    private deviceFingerprintService: DeviceFingerprintService,
    private deviceReputationService: DeviceReputationService,
    private anomalyDetectionService: AnomalyDetectionService,
    private velocityCheckService: VelocityCheckService,
    private vpnDetectionService: VPNDetectionService,
    private leaderboardGateway: LeaderboardGateway,
    private dataSource: DataSource,
  ) {}

  async listVotes(filters: {
    page?: number;
    limit?: number;
    eventId?: number;
    categoryId?: number;
    contestantId?: number;
    voterId?: number;
    status?: VoteStatus;
    tenantId?: number;
  }): Promise<{ data: VoteEntity[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 20));

    const qb = this.votesRepository
      .createQueryBuilder('vote')
      .orderBy('vote.created_at', 'DESC');

    if (filters.tenantId !== undefined) {
      qb.innerJoin(EventEntity, 'event_scope', 'event_scope.id = vote.event_id')
        .andWhere('event_scope.tenant_id = :tenantId', { tenantId: filters.tenantId });
    }

    if (filters.eventId !== undefined) qb.andWhere('vote.event_id = :eventId', { eventId: filters.eventId });
    if (filters.categoryId !== undefined) qb.andWhere('vote.category_id = :categoryId', { categoryId: filters.categoryId });
    if (filters.contestantId !== undefined) qb.andWhere('vote.contestant_id = :contestantId', { contestantId: filters.contestantId });
    if (filters.voterId !== undefined) qb.andWhere('vote.voter_id = :voterId', { voterId: filters.voterId });
    if (filters.status !== undefined) qb.andWhere('vote.status = :status', { status: filters.status });

    const total = await qb.getCount();
    const pages = Math.ceil(total / limit);
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Cast a vote with comprehensive fraud detection
   */
  async castVote(
    voterId: number | null,
    createVoteDto: CreateVoteDto,
    options?: {
      allowPaidFromWallet?: boolean;
      tenantId?: number;
    },
  ): Promise<VoteEntity> {
    const {
      eventId,
      categoryId,
      contestantId,
      voteType,
      paymentId,
      deviceFingerprint,
      userAgent,
      ipAddress,
    } = createVoteDto;

    // Verify event exists and is active
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['categories', 'contestants', 'votes', 'batches', 'payments', 'creator'],
    });
    if (!event) {
      throw new BadRequestException('Event not found');
    }
    const tenantScope = options?.tenantId ?? (await this.resolveTenantIdByUser(voterId));
    if (tenantScope !== undefined && event.tenant_id !== tenantScope) {
      throw new UnauthorizedException('Event does not belong to authenticated tenant scope');
    }
    if (!this.isEventAcceptingVotes(event)) {
      throw new BadRequestException(
        `Voting is not open for this event. Current status: ${event.status}.`,
      );
    }

    // Verify category exists
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
      relations: ['contestants', 'votes', 'event'],
    });
    if (!category || category.event_id !== eventId) {
      throw new BadRequestException('Category not found or invalid event');
    }

    // Verify contestant exists
    const contestant = await this.contestantsRepository.findOne({
      where: { id: contestantId },
      relations: ['votes', 'payments', 'media', 'event', 'category', 'user'],
    });
    if (!contestant || contestant.event_id !== eventId) {
      throw new BadRequestException('Contestant not found or invalid event');
    }

    // ============ VOTE LIMIT ENFORCEMENT ============
    // Checks use the limit columns already on EventEntity and CategoryEntity.
    // NULL means unlimited — admin leaves the field empty to impose no restriction.

    // 1. Event-level: absolute cap on total votes per authenticated user
    if (event.max_votes_per_user != null && voterId) {
      const total = await this.votesRepository.count({
        where: {
          voter_id: voterId,
          event_id: eventId,
          status: In([VoteStatus.VALID, VoteStatus.PENDING]),
        },
      });
      if (total >= event.max_votes_per_user) {
        throw new BadRequestException(
          `You have reached the maximum of ${event.max_votes_per_user} votes for this event.`,
        );
      }
    }

    // 2. Category-level: absolute cap on total votes per authenticated user
    if (category.max_votes_per_user != null && voterId) {
      const total = await this.votesRepository.count({
        where: {
          voter_id: voterId,
          event_id: eventId,
          category_id: categoryId,
          status: In([VoteStatus.VALID, VoteStatus.PENDING]),
        },
      });
      if (total >= category.max_votes_per_user) {
        throw new BadRequestException(
          `You have reached the maximum of ${category.max_votes_per_user} votes for this category.`,
        );
      }
    }

    // 3. Category-level: daily total votes for ALL users combined
    if (category.daily_vote_limit != null) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const dailyTotal = await this.votesRepository.count({
        where: {
          event_id: eventId,
          category_id: categoryId,
          status: VoteStatus.VALID,
          created_at: MoreThan(since),
        },
      });
      if (dailyTotal >= category.daily_vote_limit) {
        throw new BadRequestException(
          `This category has reached its daily vote limit of ${category.daily_vote_limit}.`,
        );
      }
    }
    // ============ END VOTE LIMIT ENFORCEMENT ============

    // ============ FRAUD DETECTION LAYER ============
    let deviceId: number | null = null;
    let deviceRiskScore = 0;
    
    // 1. Device Fingerprinting - Check/Register Device
    if (deviceFingerprint) {
      const fingerprintResult = await this.deviceFingerprintService.checkDevice({
        canvasFingerprint: deviceFingerprint,
        userAgent: userAgent,
      });
      deviceId = fingerprintResult.deviceId;
      deviceRiskScore = fingerprintResult.riskScore;
      
      // Update device activity
      if (deviceId) {
        await this.deviceFingerprintService.updateDeviceActivity(deviceId);
      }
    }

    // 2. Velocity Check - Rate Limiting
    // Use event's max_daily_votes_per_user as the per-day cap if configured;
    // otherwise fall back to the service default (100).
    const velocityCheck = await this.velocityCheckService.checkVelocity(
      voterId,
      deviceId,
      ipAddress || '0.0.0.0',
      eventId,
      categoryId,
      {
        perMinute: 3,
        perHour: 20,
        perDay: event.max_daily_votes_per_user ?? 100,
      },
    );
    if (!velocityCheck.isAllowed) {
      throw new BadRequestException({
        message: velocityCheck.message,
        code: 'VELOCITY_LIMIT_EXCEEDED',
        retryAfter: 60, // seconds
      });
    }

    // 3. VPN/Proxy Detection
    const vpnResult = await this.vpnDetectionService.detectVPN(ipAddress || '0.0.0.0');
    
    // Block vote if VPN detected and configured to block
    if (this.vpnDetectionService.shouldBlockVote(vpnResult, true, true, true)) {
      // Log the detection but still allow vote with high risk
      await this.vpnDetectionService.logDetection(ipAddress || '0.0.0.0', vpnResult);
    }

    // 4. Device Reputation - Get Trust Score
    let reputationScore = 1.0;
    let reputationResult = null;
    if (deviceId) {
      reputationResult = await this.deviceReputationService.getReputation(deviceId);
      reputationScore = reputationResult.trustScore;
    }

    // 5. Anomaly Detection - Check for suspicious behavior
    const anomalyResult = await this.anomalyDetectionService.checkAnomalies(
      voterId,
      deviceId,
      ipAddress || '0.0.0.0',
    );

    // 6. Comprehensive Fraud Score Calculation
    const { score: fraudScore, level: fraudRiskLevel, reasons } =
      await this.fraudDetectionService.calculateFraudScore(
        voterId,
        ipAddress || '0.0.0.0',
        deviceId,
        deviceFingerprint,
      );

    // Add VPN and anomaly factors to fraud score
    let totalFraudScore = fraudScore;
    if (vpnResult.isVPNOrProxy) {
      totalFraudScore += vpnResult.confidence * 0.15;
    }
    if (anomalyResult.hasAnomaly) {
      totalFraudScore += anomalyResult.riskScore * 0.1;
    }
    if (deviceRiskScore > 0) {
      totalFraudScore += deviceRiskScore * 0.1;
    }
    if (reputationScore < 1.0) {
      totalFraudScore += (1 - reputationScore) * 0.15;
    }

    // Cap at 1.0
    totalFraudScore = Math.min(totalFraudScore, 1.0);

    // Determine vote status based on fraud score
    const status = this.fraudDetectionService.getVoteStatus(totalFraudScore);

    // Create fraud alert if suspicious
    if (fraudRiskLevel !== FraudRiskLevel.LOW || vpnResult.threatLevel === 'high' || anomalyResult.hasAnomaly) {
      console.log('🚨 Fraud Alert:', {
        fraudScore: totalFraudScore,
        fraudRiskLevel,
        reasons,
        vpnDetection: vpnResult,
        anomalyDetection: anomalyResult,
        velocityCheck,
        reputation: reputationResult,
      });
    }

    // Paid votes must only come through the payment webhook — never directly from the frontend.
    // This prevents bypassing the payment flow and double-counting.
    if (voteType === VoteType.PAID && !options?.allowPaidFromWallet) {
      throw new BadRequestException(
        'Paid votes are created automatically after payment confirmation. Use POST /api/v1/payments to start a payment.',
      );
    }

    if (voteType === VoteType.PAID && !voterId) {
      throw new BadRequestException('Paid votes require authenticated voter session');
    }

    // Create vote within transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create vote record
      const vote = this.votesRepository.create({
        event: event,
        event_id: event.id,
        category: category,
        category_id: category.id,
        contestant: contestant,
        contestant_id: contestant.id,
        voter_id: voterId,
        vote_type: voteType,
        payment_id: paymentId,
        device_id: deviceId,
        status,
        fraud_risk_level: totalFraudScore >= 0.6 ? FraudRiskLevel.HIGH : totalFraudScore >= 0.3 ? FraudRiskLevel.MEDIUM : FraudRiskLevel.LOW,
        fraud_risk_score: totalFraudScore,
        ip_address: ipAddress,
        user_agent: userAgent,
        voter_country: vpnResult.country,
        voting_timestamp: new Date(),
      } as DeepPartial<VoteEntity>);

      const savedVote = await queryRunner.manager.save(VoteEntity, vote);

      // Generate vote receipt
      const receiptCode = this.generateReceiptCode(eventId, savedVote.id);
      const voteHash = this.generateVoteHash(savedVote.id, contestantId, eventId);

      const receipt = this.votesReceiptRepository.create({
        vote: savedVote,
        vote_id: savedVote.id,
        event_id: eventId,
        receipt_code: receiptCode,
        receipt_hash: voteHash,
        is_verified: false,
      });

      await queryRunner.manager.save(VoteReceiptEntity, receipt);

      // Update contestant vote count (only if vote is valid)
      if (status === VoteStatus.VALID) {
        let paidIncrement = 0;
        let freeIncrement = 0;
        if (voteType === VoteType.FREE) {
          freeIncrement = 1;
          contestant.free_vote_count += 1;
        } else {
          paidIncrement = 1;
          contestant.paid_vote_count += 1;
        }
        contestant.vote_count += 1;
        await queryRunner.manager
          .createQueryBuilder()
          .update(ContestantEntity)
          .set({
            vote_count: () => 'vote_count + 1',
            paid_vote_count: () => `paid_vote_count + ${paidIncrement}`,
            free_vote_count: () => `free_vote_count + ${freeIncrement}`,
          })
          .where('id = :id', { id: contestant.id })
          .execute();

        // Broadcast real-time vote update via WebSocket
        this.leaderboardGateway.broadcastVoteUpdate(eventId, categoryId, {
          contestantId,
          voteCount: contestant.vote_count,
          paidVoteCount: contestant.paid_vote_count,
          freeVoteCount: contestant.free_vote_count,
        });
      }

      await queryRunner.commitTransaction();

      // ============ POST-VOTE REPUTATION UPDATE ============
      // Update device reputation after vote is committed
      if (deviceId) {
        try {
          if (status === VoteStatus.VALID) {
            await this.deviceReputationService.updateReputation(deviceId, {
              successIncrement: true,
            });
          } else if (status === VoteStatus.FRAUD_SUSPECTED || status === VoteStatus.INVALID) {
            await this.deviceReputationService.updateReputation(deviceId, {
              fraudIncrement: true,
            });
          }
        } catch (error) {
          console.error('Error updating device reputation:', error);
        }
      }

      return savedVote;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Generate receipt code
   */
  private generateReceiptCode(eventId: number, voteId: number): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const hash = crypto
      .createHash('sha256')
      .update(`${eventId}-${voteId}-${timestamp}`)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();
    return `VOTE-${timestamp}-${hash}`;
  }

  /**
   * Generate vote hash for blockchain verification
   */
  private generateVoteHash(voteId: number, contestantId: number, eventId: number): string {
    return crypto
      .createHash('sha256')
      .update(`${voteId}:${contestantId}:${eventId}:${Date.now()}`)
      .digest('hex');
  }

  private isEventAcceptingVotes(event: EventEntity): boolean {
    if (event.status !== EventStatus.ACTIVE) {
      return false;
    }

    const now = new Date();
    const votingStart = event.voting_start ? new Date(event.voting_start) : null;
    const votingEnd = event.voting_end ? new Date(event.voting_end) : null;

    if (votingStart && now < votingStart) {
      return false;
    }
    if (votingEnd && now > votingEnd) {
      return false;
    }
    return true;
  }

  private async resolveTenantIdByUser(voterId: number | null): Promise<number | undefined> {
    if (!voterId) {
      return undefined;
    }

    const user = await this.usersRepository.findOne({
      where: { id: voterId },
      select: ['id', 'tenant_id'],
    });

    if (!user || user.tenant_id == null) {
      return undefined;
    }

    return user.tenant_id;
  }

  /**
   * Get vote by ID
   */
  async getVoteById(voteId: number, tenantId?: number): Promise<VoteEntity> {
    const vote = await this.votesRepository.findOne({
      where: { id: voteId },
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
    if (!vote) {
      throw new BadRequestException('Vote not found');
    }
    if (tenantId !== undefined && vote.event?.tenant_id !== tenantId) {
      throw new BadRequestException('Vote not found');
    }
    return vote;
  }

  /**
   * Get vote receipt
   */
  async getVoteReceipt(voteId: number, tenantId?: number): Promise<VoteReceiptEntity> {
    const receipt = await this.votesReceiptRepository.findOne({
      where: { vote_id: voteId },
      relations: ['vote', 'vote.event'],
    });
    if (!receipt) {
      throw new BadRequestException('Vote receipt not found');
    }
    if (tenantId !== undefined && receipt.vote?.event?.tenant_id !== tenantId) {
      throw new BadRequestException('Vote receipt not found');
    }
    return receipt;
  }

  /**
   * Verify vote receipt
   */
  async verifyVoteReceipt(receiptCode: string, tenantId?: number): Promise<{ valid: boolean; vote?: VoteEntity }> {
    const receipt = await this.votesReceiptRepository.findOne({
      where: { receipt_code: receiptCode },
      relations: ['vote', 'vote.event'],
    });

    if (!receipt) {
      return { valid: false };
    }

    if (tenantId !== undefined && receipt.vote?.event?.tenant_id !== tenantId) {
      return { valid: false };
    }

    return {
      valid: true,
      vote: receipt.vote,
    };
  }

  /**
   * Get leaderboard for a category
   */
  async getLeaderboard(eventId: number, categoryId: number, limit: number = 100, tenantId?: number) {
    if (tenantId !== undefined) {
      const event = await this.eventsRepository.findOne({
        where: { id: eventId, tenant_id: tenantId },
        select: ['id'],
      });
      if (!event) {
        throw new BadRequestException('Event not found');
      }
    }

    const leaderboard = await this.contestantsRepository.find({
      where: {
        event_id: eventId,
        category_id: categoryId,
      },
      relations: ['votes', 'payments', 'media', 'event', 'category', 'user'],
      order: { vote_count: 'DESC' },
      take: limit,
      select: ['id', 'first_name', 'last_name', 'vote_count', 'paid_vote_count', 'free_vote_count'],
    });

    return leaderboard.map((contestant, index) => ({
      rank: index + 1,
      ...contestant,
    }));
  }
}
