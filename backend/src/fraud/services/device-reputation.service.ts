import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { DeviceReputationEntity } from '@/entities/device-reputation.entity';
import { VoteEntity, VoteStatus } from '@/entities/vote.entity';

export interface ReputationResult {
  trustScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  fraudCount: number;
  successfulVotes: number;
  failedVotes: number;
  riskFactors: string[];
}

export interface ReputationUpdate {
  fraudIncrement?: boolean;
  successIncrement?: boolean;
  failureIncrement?: boolean;
  verificationFailure?: boolean;
}

@Injectable()
export class DeviceReputationService {
  private readonly logger = new Logger(DeviceReputationService.name);

  // Trust score thresholds
  private readonly TRUST_LEVELS = {
    CRITICAL: 0.2,
    HIGH: 0.4,
    MEDIUM: 0.7,
    LOW: 1.0,
  };

  constructor(
    @InjectRepository(DeviceReputationEntity)
    private reputationRepository: Repository<DeviceReputationEntity>,
    @InjectRepository(VoteEntity)
    private voteRepository: Repository<VoteEntity>,
  ) {}

  /**
   * Get or create device reputation record
   */
  async getOrCreateReputation(deviceId: number): Promise<DeviceReputationEntity> {
    let reputation = await this.reputationRepository.findOne({
      where: { device_id: deviceId },
    });

    if (!reputation) {
      reputation = await this.reputationRepository.save({
        device_id: deviceId,
        trust_score: 1.0, // New devices start with full trust
        fraud_count: 0,
        successful_votes: 0,
        failed_votes: 0,
        verification_failures: 0,
        risk_factors: '',
      });
      this.logger.log(`Created new reputation record for device ${deviceId}`);
    }

    return reputation;
  }

  /**
   * Get device reputation with calculated risk
   */
  async getReputation(deviceId: number): Promise<ReputationResult> {
    const reputation = await this.getOrCreateReputation(deviceId);

    const riskFactors: string[] = [];

    // Analyze risk factors
    if (reputation.fraud_count > 0) {
      riskFactors.push(`Fraud attempts: ${reputation.fraud_count}`);
    }
    if (reputation.verification_failures > 3) {
      riskFactors.push('Multiple verification failures');
    }
    if (reputation.trust_score < this.TRUST_LEVELS.MEDIUM) {
      riskFactors.push('Low trust score');
    }
    if (reputation.failed_votes > reputation.successful_votes * 0.5) {
      riskFactors.push('High failure rate');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (reputation.trust_score >= this.TRUST_LEVELS.MEDIUM) {
      riskLevel = 'low';
    } else if (reputation.trust_score >= this.TRUST_LEVELS.HIGH) {
      riskLevel = 'medium';
    } else if (reputation.trust_score >= this.TRUST_LEVELS.CRITICAL) {
      riskLevel = 'high';
    } else {
      riskLevel = 'critical';
    }

    return {
      trustScore: Number(reputation.trust_score),
      riskLevel,
      fraudCount: reputation.fraud_count,
      successfulVotes: reputation.successful_votes,
      failedVotes: reputation.failed_votes,
      riskFactors,
    };
  }

  /**
   * Update device reputation based on vote outcome
   */
  async updateReputation(
    deviceId: number,
    update: ReputationUpdate,
  ): Promise<DeviceReputationEntity> {
    const reputation = await this.getOrCreateReputation(deviceId);

    if (update.fraudIncrement) {
      reputation.fraud_count += 1;
      // Decrease trust score by 0.2 for each fraud
      reputation.trust_score = Math.max(0, Number(reputation.trust_score) - 0.2);
    }

    if (update.successIncrement) {
      reputation.successful_votes += 1;
      // Slight trust increase for successful votes (capped at 1.0)
      reputation.trust_score = Math.min(1.0, Number(reputation.trust_score) + 0.01);
    }

    if (update.failureIncrement) {
      reputation.failed_votes += 1;
      // Decrease trust for failed votes
      reputation.trust_score = Math.max(0, Number(reputation.trust_score) - 0.05);
    }

    if (update.verificationFailure) {
      reputation.verification_failures += 1;
      // Significant trust drop for verification failures
      reputation.trust_score = Math.max(0, Number(reputation.trust_score) - 0.15);
    }

    // Update risk factors
    reputation.risk_factors = this.calculateRiskFactors(reputation);

    return this.reputationRepository.save(reputation);
  }

  /**
   * Calculate trust score based on historical behavior
   */
  async calculateHistoricalTrust(deviceId: number): Promise<number> {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get vote statistics for last 30 days
    const voteStats = await this.voteRepository
      .createQueryBuilder('v')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN v.status = :valid THEN 1 ELSE 0 END)', 'valid')
      .addSelect('SUM(CASE WHEN v.status = :fraud THEN 1 ELSE 0 END)', 'fraud')
      .where('v.device_id = :deviceId', { deviceId })
      .andWhere('v.created_at > :oneMonthAgo', { oneMonthAgo })
      .setParameters({ valid: VoteStatus.VALID, fraud: VoteStatus.FRAUD_SUSPECTED })
      .getRawOne();

    const total = parseInt(voteStats?.total || '0');
    const valid = parseInt(voteStats?.valid || '0');
    const fraud = parseInt(voteStats?.fraud || '0');

    if (total === 0) {
      return 1.0; // New device gets default trust
    }

    // Calculate trust based on success rate
    const successRate = valid / total;
    const fraudRate = fraud / total;

    // Base trust on success rate (0.5) minus fraud penalty (0.4 max)
    let trust = successRate - (fraudRate * 0.8);

    // Boost for high volume of valid votes
    if (valid > 50) trust += 0.1;
    else if (valid > 20) trust += 0.05;
    else if (valid > 10) trust += 0.02;

    return Math.max(0, Math.min(1.0, trust));
  }

  /**
   * Reset device trust score (admin action)
   */
  async resetTrustScore(deviceId: number): Promise<void> {
    await this.reputationRepository.update(
      { device_id: deviceId },
      {
        trust_score: 1.0,
        fraud_count: 0,
        failed_votes: 0,
        verification_failures: 0,
        risk_factors: '',
      },
    );
    this.logger.log(`Reset trust score for device ${deviceId}`);
  }

  /**
   * Get low trust devices for review
   */
  async getLowTrustDevices(limit: number = 50): Promise<DeviceReputationEntity[]> {
    return this.reputationRepository.find({
      where: [
        { trust_score: LessThan(this.TRUST_LEVELS.HIGH) },
      ],
      order: { trust_score: 'ASC' },
      take: limit,
      relations: ['device'],
    });
  }

  /**
   * Calculate risk factors string
   */
  private calculateRiskFactors(reputation: DeviceReputationEntity): string {
    const factors: string[] = [];

    if (reputation.fraud_count > 0) {
      factors.push('fraud');
    }
    if (reputation.verification_failures > 3) {
      factors.push('verify_fail');
    }
    if (reputation.trust_score < this.TRUST_LEVELS.MEDIUM) {
      factors.push('low_trust');
    }
    if (reputation.failed_votes > reputation.successful_votes * 0.3) {
      factors.push('high_fail_rate');
    }

    return factors.join(',');
  }

  /**
   * Get reputation statistics
   */
  async getReputationStats(): Promise<any> {
    const total = await this.reputationRepository.count();
    const lowTrust = await this.reputationRepository.count({
      where: { trust_score: LessThan(this.TRUST_LEVELS.HIGH) },
    });
    const critical = await this.reputationRepository.count({
      where: { trust_score: LessThan(this.TRUST_LEVELS.CRITICAL) },
    });
    const highFraud = await this.reputationRepository.count({
      where: { fraud_count: MoreThan(0) },
    });

    return {
      totalDevices: total,
      lowTrustDevices: lowTrust,
      criticalDevices: critical,
      devicesWithFraud: highFraud,
      healthyRate: total > 0 
        ? (((total - lowTrust) / total) * 100).toFixed(2) + '%'
        : '0%',
    };
  }
}
