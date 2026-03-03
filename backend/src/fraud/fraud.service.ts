import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudLogEntity, FraudSeverity } from '@/entities/fraud-log.entity';
import { DeviceEntity } from '@/entities/device.entity';
import { DeviceFingerprintEntity } from '@/entities/device-fingerprint.entity';
import { DeviceReputationEntity } from '@/entities/device-reputation.entity';
import { VelocityViolationEntity } from '@/entities/velocity-violation.entity';
import { SuspiciousIPReputationEntity } from '@/entities/suspicious-ip-reputation.entity';
import { VoteEntity, FraudRiskLevel, VoteStatus } from '@/entities/vote.entity';
import { FraudDetectionService } from './services/fraud-detection.service';

/**
 * Helper function to map FraudRiskLevel to FraudSeverity
 */
function mapRiskLevelToSeverity(level: FraudRiskLevel): FraudSeverity {
  switch (level) {
    case FraudRiskLevel.LOW:
      return FraudSeverity.LOW;
    case FraudRiskLevel.MEDIUM:
      return FraudSeverity.MEDIUM;
    case FraudRiskLevel.HIGH:
      return FraudSeverity.HIGH;
    default:
      return FraudSeverity.MEDIUM;
  }
}

@Injectable()
export class FraudService {
  constructor(
    @InjectRepository(FraudLogEntity)
    private fraudLogRepository: Repository<FraudLogEntity>,
    @InjectRepository(DeviceEntity)
    private deviceRepository: Repository<DeviceEntity>,
    @InjectRepository(DeviceFingerprintEntity)
    private fingerprintRepository: Repository<DeviceFingerprintEntity>,
    @InjectRepository(DeviceReputationEntity)
    private reputationRepository: Repository<DeviceReputationEntity>,
    @InjectRepository(VelocityViolationEntity)
    private velocityRepository: Repository<VelocityViolationEntity>,
    @InjectRepository(SuspiciousIPReputationEntity)
    private ipReputationRepository: Repository<SuspiciousIPReputationEntity>,
    @InjectRepository(VoteEntity)
    private votesRepository: Repository<VoteEntity>,
    private fraudDetectionService: FraudDetectionService,
  ) {}

  /**
   * Get fraud dashboard statistics
   */
  async getFraudDashboardStats(tenantId?: number): Promise<any> {
    const baseQuery = () => {
      const qb = this.fraudLogRepository.createQueryBuilder('fraud');
      if (tenantId !== undefined) {
        qb.innerJoin('fraud.event', 'event')
          .andWhere('event.tenant_id = :tenantId', { tenantId });
      }
      return qb;
    };

    const totalFraudCases = await baseQuery().getCount();
    const highSeverity = await baseQuery()
      .andWhere('fraud.severity = :severity', { severity: FraudSeverity.HIGH })
      .getCount();
    const pendingCases = await baseQuery()
      .andWhere('fraud.is_resolved = :resolved', { resolved: false })
      .getCount();

    return {
      totalFraudCases,
      highSeverity,
      pendingCases,
      resolvedCases: totalFraudCases - pendingCases,
    };
  }

  /**
   * Get fraud cases with pagination
   */
  async getFraudCases(
    page: number = 1,
    limit: number = 20,
    severity?: string,
    status?: string,
    tenantId?: number,
  ): Promise<{ data: FraudLogEntity[]; pagination: any }> {
    const queryBuilder = this.fraudLogRepository.createQueryBuilder('fraud');

    if (tenantId !== undefined) {
      queryBuilder.innerJoin('fraud.event', 'event')
        .andWhere('event.tenant_id = :tenantId', { tenantId });
    }

    if (severity) {
      queryBuilder.andWhere('fraud.severity = :severity', { severity });
    }

    if (status) {
      const normalizedStatus = status.toLowerCase();
      if (normalizedStatus === 'resolved') {
        queryBuilder.andWhere('fraud.is_resolved = :resolved', { resolved: true });
      } else if (normalizedStatus === 'pending' || normalizedStatus === 'open' || normalizedStatus === 'unresolved') {
        queryBuilder.andWhere('fraud.is_resolved = :resolved', { resolved: false });
      }
    }
    
    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);
    
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('fraud.created_at', 'DESC')
      .getMany();
    
    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get fraud case by ID
   */
  async getFraudCaseById(id: number, tenantId?: number): Promise<FraudLogEntity> {
    const fraudCase = await this.fraudLogRepository.findOne({
      where: { id },
      relations: ['device', 'vote', 'event'],
    });
    if (!fraudCase) {
      throw new BadRequestException('Fraud case not found');
    }
    if (tenantId !== undefined && fraudCase.event?.tenant_id !== tenantId) {
      throw new BadRequestException('Fraud case not found');
    }
    return fraudCase;
  }

  /**
   * Resolve fraud case
   */
  async resolveFraudCase(
    id: number,
    resolution: string,
    action: string,
    adminId: number,
    tenantId?: number,
  ): Promise<FraudLogEntity> {
    const fraudCase = await this.getFraudCaseById(id, tenantId);
    fraudCase.is_resolved = true;
    fraudCase.resolved_by_user_id = adminId;
    fraudCase.action_taken = action || 'resolved';
    fraudCase.action_timestamp = new Date();
    fraudCase.description = [fraudCase.description, `Resolution: ${resolution}`]
      .filter(Boolean)
      .join(' | ');
    return this.fraudLogRepository.save(fraudCase);
  }

  /**
   * Get device reputation data
   */
  async getDeviceReputation(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: any[]; pagination: any }> {
    const queryBuilder = this.reputationRepository.createQueryBuilder('rep');
    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);
    
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('rep.score', 'ASC')
      .getMany();
    
    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get velocity violations
   */
  async getVelocityViolations(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: VelocityViolationEntity[]; pagination: any }> {
    const queryBuilder = this.velocityRepository.createQueryBuilder('vel');
    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);
    
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('vel.created_at', 'DESC')
      .getMany();
    
    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get VPN detections
   */
  async getVpnDetections(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: any[]; pagination: any }> {
    const queryBuilder = this.ipReputationRepository.createQueryBuilder('ip');
    queryBuilder.where('ip.threat_level IN (:...levels)', { levels: ['high', 'critical'] });
    
    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);
    
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('ip.last_updated', 'DESC')
      .getMany();
    
    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get trust score data
   */
  async getTrustScoreData(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: any[]; pagination: any }> {
    const queryBuilder = this.reputationRepository.createQueryBuilder('rep');
    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);
    
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('rep.score', 'DESC')
      .getMany();
    
    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Detect fraud for a vote
   */
  async detectFraud(voteId: number): Promise<any> {
    try {
      // Fetch the vote with related data
      const vote = await this.votesRepository.findOne({
        where: { id: voteId },
        relations: ['device'],
      });

      if (!vote) {
        throw new BadRequestException(`Vote ${voteId} not found`);
      }

      // Calculate fraud score using the fraud detection service
      const deviceFingerprint = vote.device_id?.toString() || 'unknown';
      const ipAddress = vote.ip_address || '0.0.0.0';

      const fraudResult = await this.fraudDetectionService.calculateFraudScore(
        vote.voter_id,
        ipAddress,
        vote.device_id ?? null,
        deviceFingerprint,
      );

      // Create fraud log entry
      const severity = mapRiskLevelToSeverity(fraudResult.level);
      const fraudLog = this.fraudLogRepository.create({
        event_id: vote.event_id,
        vote_id: vote.id,
        user_id: vote.voter_id,
        device_id: vote.device_id,
        fraud_type: fraudResult.level === FraudRiskLevel.HIGH ? 'high-risk-pattern' : 'anomaly',
        severity: severity,
        description: fraudResult.reasons.join('; '),
        fraud_details: {
          reasons: fraudResult.reasons,
          score: fraudResult.score,
          level: fraudResult.level,
        },
        is_resolved: false,
      });

      const savedLog = await this.fraudLogRepository.save(fraudLog);

      // Update vote status based on fraud result
      vote.fraud_risk_level = fraudResult.level as FraudRiskLevel;
      vote.status = this.fraudDetectionService.getVoteStatus(fraudResult.score);
      vote.trust_score = 1 - fraudResult.score; // Inverse of fraud score
      vote.anomaly_flags = fraudResult.reasons;
      await this.votesRepository.save(vote);

      // Create fraud alert if high risk
      if (fraudResult.score >= 0.7) {
        await this.fraudDetectionService.createFraudAlert(
          vote.id,
          fraudResult.score,
          fraudResult.reasons,
        );
      }

      return {
        voteId,
        isFraudulent: fraudResult.score >= 0.7,
        riskScore: fraudResult.score,
        riskLevel: fraudResult.level,
        flags: fraudResult.reasons,
        fraudLogId: (savedLog as FraudLogEntity).id,
      };
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }
}
