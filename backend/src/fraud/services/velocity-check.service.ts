import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { VelocityViolationEntity } from '@/entities/velocity-violation.entity';
import { VoteEntity } from '@/entities/vote.entity';

export interface VelocityCheckResult {
  isAllowed: boolean;
  violation: boolean;
  violationType?: 'per_minute' | 'per_hour' | 'per_day';
  currentCount: number;
  limit: number;
  remaining: number;
  message?: string;
}

export interface VelocityLimits {
  perMinute: number;  // votes per minute
  perHour: number;    // votes per hour
  perDay: number;    // votes per day
}

@Injectable()
export class VelocityCheckService {
  private readonly logger = new Logger(VelocityCheckService.name);

  // Default velocity limits (can be configured per event)
  private readonly DEFAULT_LIMITS: VelocityLimits = {
    perMinute: 3,
    perHour: 20,
    perDay: 100,
  };

  constructor(
    @InjectRepository(VelocityViolationEntity)
    private violationRepository: Repository<VelocityViolationEntity>,
    @InjectRepository(VoteEntity)
    private voteRepository: Repository<VoteEntity>,
  ) {}

  /**
   * Check velocity limits for a vote
   * Returns whether the vote is allowed and current counts
   */
  async checkVelocity(
    userId: number | null,
    deviceId: number | null,
    ipAddress: string,
    eventId: number,
    categoryId: number,
    limits: VelocityLimits = this.DEFAULT_LIMITS,
  ): Promise<VelocityCheckResult> {
    const now = new Date();

    // Check per-minute limit
    const minuteResult = await this.checkPerMinute(
      userId,
      deviceId,
      ipAddress,
      eventId,
      categoryId,
      limits.perMinute
    );
    if (minuteResult.violation) {
      await this.logViolation(
        eventId,
        categoryId,
        userId,
        ipAddress,
        deviceId?.toString() || '',
        'per_minute',
        minuteResult.currentCount,
        limits.perMinute
      );
      return minuteResult;
    }

    // Check per-hour limit
    const hourResult = await this.checkPerHour(
      userId,
      deviceId,
      ipAddress,
      eventId,
      categoryId,
      limits.perHour
    );
    if (hourResult.violation) {
      await this.logViolation(
        eventId,
        categoryId,
        userId,
        ipAddress,
        deviceId?.toString() || '',
        'per_hour',
        hourResult.currentCount,
        limits.perHour
      );
      return hourResult;
    }

    // Check per-day limit
    const dayResult = await this.checkPerDay(
      userId,
      deviceId,
      ipAddress,
      eventId,
      categoryId,
      limits.perDay
    );
    if (dayResult.violation) {
      await this.logViolation(
        eventId,
        categoryId,
        userId,
        ipAddress,
        deviceId?.toString() || '',
        'per_day',
        dayResult.currentCount,
        limits.perDay
      );
      return dayResult;
    }

    // All checks passed
    return {
      isAllowed: true,
      violation: false,
      currentCount: 0,
      limit: limits.perMinute,
      remaining: limits.perMinute,
      message: 'Vote allowed',
    };
  }

  /**
   * Check votes per minute limit
   */
  private async checkPerMinute(
    userId: number | null,
    deviceId: number | null,
    ipAddress: string,
    eventId: number,
    categoryId: number,
    limit: number,
  ): Promise<VelocityCheckResult> {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    let count = 0;

    // Count by user
    if (userId) {
      count = await this.voteRepository.count({
        where: {
          voter_id: userId,
          event_id: eventId,
          category_id: categoryId,
          created_at: MoreThan(oneMinuteAgo),
        },
      });
    }
    // Count by device if no user
    else if (deviceId) {
      count = await this.voteRepository.count({
        where: {
          device_id: deviceId,
          event_id: eventId,
          category_id: categoryId,
          created_at: MoreThan(oneMinuteAgo),
        },
      });
    }
    // Count by IP as fallback
    else {
      count = await this.voteRepository
        .createQueryBuilder('v')
        .where('v.ip_address = :ip', { ip: ipAddress })
        .andWhere('v.event_id = :eventId', { eventId })
        .andWhere('v.category_id = :categoryId', { categoryId })
        .andWhere('v.created_at > :oneMinuteAgo', { oneMinuteAgo })
        .getCount();
    }

    if (count >= limit) {
      return {
        isAllowed: false,
        violation: true,
        violationType: 'per_minute',
        currentCount: count,
        limit,
        remaining: 0,
        message: `Rate limit exceeded: ${count}/${limit} votes per minute`,
      };
    }

    return {
      isAllowed: true,
      violation: false,
      currentCount: count,
      limit,
      remaining: limit - count,
    };
  }

  /**
   * Check votes per hour limit
   */
  private async checkPerHour(
    userId: number | null,
    deviceId: number | null,
    ipAddress: string,
    eventId: number,
    categoryId: number,
    limit: number,
  ): Promise<VelocityCheckResult> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    let count = 0;

    if (userId) {
      count = await this.voteRepository.count({
        where: {
          voter_id: userId,
          event_id: eventId,
          category_id: categoryId,
          created_at: MoreThan(oneHourAgo),
        },
      });
    } else if (deviceId) {
      count = await this.voteRepository.count({
        where: {
          device_id: deviceId,
          event_id: eventId,
          category_id: categoryId,
          created_at: MoreThan(oneHourAgo),
        },
      });
    } else {
      count = await this.voteRepository
        .createQueryBuilder('v')
        .where('v.ip_address = :ip', { ip: ipAddress })
        .andWhere('v.event_id = :eventId', { eventId })
        .andWhere('v.category_id = :categoryId', { categoryId })
        .andWhere('v.created_at > :oneHourAgo', { oneHourAgo })
        .getCount();
    }

    if (count >= limit) {
      return {
        isAllowed: false,
        violation: true,
        violationType: 'per_hour',
        currentCount: count,
        limit,
        remaining: 0,
        message: `Hourly limit exceeded: ${count}/${limit} votes per hour`,
      };
    }

    return {
      isAllowed: true,
      violation: false,
      currentCount: count,
      limit,
      remaining: limit - count,
    };
  }

  /**
   * Check votes per day limit
   */
  private async checkPerDay(
    userId: number | null,
    deviceId: number | null,
    ipAddress: string,
    eventId: number,
    categoryId: number,
    limit: number,
  ): Promise<VelocityCheckResult> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    let count = 0;

    if (userId) {
      count = await this.voteRepository.count({
        where: {
          voter_id: userId,
          event_id: eventId,
          category_id: categoryId,
          created_at: MoreThan(oneDayAgo),
        },
      });
    } else if (deviceId) {
      count = await this.voteRepository.count({
        where: {
          device_id: deviceId,
          event_id: eventId,
          category_id: categoryId,
          created_at: MoreThan(oneDayAgo),
        },
      });
    } else {
      count = await this.voteRepository
        .createQueryBuilder('v')
        .where('v.ip_address = :ip', { ip: ipAddress })
        .andWhere('v.event_id = :eventId', { eventId })
        .andWhere('v.category_id = :categoryId', { categoryId })
        .andWhere('v.created_at > :oneDayAgo', { oneDayAgo })
        .getCount();
    }

    if (count >= limit) {
      return {
        isAllowed: false,
        violation: true,
        violationType: 'per_day',
        currentCount: count,
        limit,
        remaining: 0,
        message: `Daily limit exceeded: ${count}/${limit} votes per day`,
      };
    }

    return {
      isAllowed: true,
      violation: false,
      currentCount: count,
      limit,
      remaining: limit - count,
    };
  }

  /**
   * Log a velocity violation
   */
  async logViolation(
    eventId: number,
    categoryId: number,
    userId: number | null,
    ipAddress: string,
    deviceFingerprint: string,
    violationType: string,
    count: number,
    limit: number,
  ): Promise<void> {
    try {
      const violation = this.violationRepository.create({
        event_id: eventId,
        category_id: categoryId,
        device_id: deviceFingerprint ? Number(deviceFingerprint) || 0 : 0,
        user_id: userId ?? undefined,
        ip_address: ipAddress,
        device_fingerprint: deviceFingerprint,
        violation_type: violationType,
        violation_count: count,
        limit_count: limit,
        severity: count >= limit * 3 ? 'high' : 'medium',
        is_fraud: count > limit,
        description: `Exceeded ${violationType} limit: ${count}/${limit} votes`,
      });

      await this.violationRepository.save(violation);
      this.logger.warn(
        `Velocity violation: User ${userId}, IP ${ipAddress}, Type ${violationType}, Count ${count}/${limit}`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error logging velocity violation: ${errorMessage}`);
    }
  }

  /**
   * Get velocity violations for admin review
   */
  async getViolations(
    eventId?: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: VelocityViolationEntity[]; pagination: any }> {
    const queryBuilder = this.violationRepository.createQueryBuilder('v');

    if (eventId) {
      queryBuilder.andWhere('v.event_id = :eventId', { eventId });
    }

    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);

    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('v.detected_at', 'DESC')
      .getMany();

    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get velocity statistics
   */
  async getVelocityStats(): Promise<any> {
    const totalViolations = await this.violationRepository.count();

    // Violations by type
    const byType = await this.violationRepository
      .createQueryBuilder('v')
      .select('v.violation_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('v.violation_type')
      .getRawMany();

    // Recent violations (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentViolations = await this.violationRepository.count({
      where: {
        detected_at: MoreThan(oneDayAgo),
      },
    });

    // Top offending IPs
    const topIPs = await this.violationRepository
      .createQueryBuilder('v')
      .select('v.ip_address', 'ip')
      .addSelect('COUNT(*)', 'count')
      .groupBy('v.ip_address')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalViolations,
      recentViolations,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {} as Record<string, number>),
      topOffendingIPs: topIPs,
    };
  }

  /**
   * Check if IP is in cooldown period after violations
   */
  async isInCooldown(ipAddress: string, cooldownMinutes: number = 15): Promise<boolean> {
    const cooldownStart = new Date(Date.now() - cooldownMinutes * 60 * 1000);

    const recentViolations = await this.violationRepository.count({
      where: {
        ip_address: ipAddress,
        detected_at: MoreThan(cooldownStart),
      },
    });

    return recentViolations > 0;
  }

  /**
   * Get time until cooldown expires
   */
  async getCooldownRemaining(
    ipAddress: string,
    cooldownMinutes: number = 15,
  ): Promise<number | null> {
    const cooldownStart = new Date(Date.now() - cooldownMinutes * 60 * 1000);

    const lastViolation = await this.violationRepository.findOne({
      where: {
        ip_address: ipAddress,
        detected_at: MoreThan(cooldownStart),
      },
      order: { detected_at: 'DESC' },
    });

    if (!lastViolation) {
      return null;
    }

    const timeSinceViolation = Date.now() - lastViolation.detected_at.getTime();
    const remaining = (cooldownMinutes * 60 * 1000) - timeSinceViolation;

    return Math.max(0, Math.ceil(remaining / 1000 / 60)); // Return minutes
  }
}
