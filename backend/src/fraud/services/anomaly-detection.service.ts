import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { DeviceAnomalyEntity } from '@/entities/device-anomaly.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { DeviceEntity } from '@/entities/device.entity';

export interface AnomalyResult {
  hasAnomaly: boolean;
  anomalyType?: string;
  riskScore: number;
  description: string;
}

export interface AnomalyTypes {
  LOCATION_JUMP: 'location_jump';
  TIMEZONE_CHANGE: 'timezone_change';
  NEW_DEVICE: 'new_device';
  RAPID_VOTING: 'rapid_voting';
  UNUSUAL_PATTERN: 'unusual_pattern';
  IP_CHANGE: 'ip_change';
  DEVICE_SWITCH: 'device_switch';
}

@Injectable()
export class AnomalyDetectionService {
  private readonly logger = new Logger(AnomalyDetectionService.name);

  // Anomaly type constants
  readonly ANOMALY_TYPES: AnomalyTypes = {
    LOCATION_JUMP: 'location_jump',
    TIMEZONE_CHANGE: 'timezone_change',
    NEW_DEVICE: 'new_device',
    RAPID_VOTING: 'rapid_voting',
    UNUSUAL_PATTERN: 'unusual_pattern',
    IP_CHANGE: 'ip_change',
    DEVICE_SWITCH: 'device_switch',
  };

  // Maximum distance in km that's physically possible in given time
  private readonly MAX_SPEED_KMH = 900; // Commercial flight speed

  constructor(
    @InjectRepository(DeviceAnomalyEntity)
    private anomalyRepository: Repository<DeviceAnomalyEntity>,
    @InjectRepository(VoteEntity)
    private voteRepository: Repository<VoteEntity>,
    @InjectRepository(DeviceEntity)
    private deviceRepository: Repository<DeviceEntity>,
  ) {}

  /**
   * Check for all types of anomalies
   */
  async checkAnomalies(
    userId: number | null,
    deviceId: number | null,
    ipAddress: string,
    newCountry?: string,
    newTimezone?: string,
  ): Promise<AnomalyResult> {
    const anomalies: AnomalyResult[] = [];

    // Check location jump (impossible travel)
    if (userId) {
      const locationAnomaly = await this.checkLocationJump(userId, newCountry);
      if (locationAnomaly.hasAnomaly) {
        anomalies.push(locationAnomaly);
      }
    }

    // Check timezone change
    if (deviceId && newTimezone) {
      const timezoneAnomaly = await this.checkTimezoneChange(deviceId, newTimezone);
      if (timezoneAnomaly.hasAnomaly) {
        anomalies.push(timezoneAnomaly);
      }
    }

    // Check rapid voting pattern
    if (userId) {
      const rapidVotingAnomaly = await this.checkRapidVotingPattern(userId);
      if (rapidVotingAnomaly.hasAnomaly) {
        anomalies.push(rapidVotingAnomaly);
      }
    }

    // Check unusual pattern (same contestant voted repeatedly)
    if (userId) {
      const patternAnomaly = await this.checkUnusualPattern(userId);
      if (patternAnomaly.hasAnomaly) {
        anomalies.push(patternAnomaly);
      }
    }

    // Check IP change (user switching IPs rapidly)
    if (userId) {
      const ipChangeAnomaly = await this.checkIPChange(userId, ipAddress);
      if (ipChangeAnomaly.hasAnomaly) {
        anomalies.push(ipChangeAnomaly);
      }
    }

    // Return highest risk anomaly
    if (anomalies.length > 0) {
      const highestRisk = anomalies.reduce((prev, curr) => 
        curr.riskScore > prev.riskScore ? curr : prev
      );
      return highestRisk;
    }

    return {
      hasAnomaly: false,
      riskScore: 0,
      description: 'No anomalies detected',
    };
  }

  /**
   * Check for impossible travel (location jump)
   */
  private async checkLocationJump(userId: number, newCountry?: string): Promise<AnomalyResult> {
    try {
      // Get last vote location
      const lastVote = await this.voteRepository.findOne({
        where: { voter_id: userId },
        order: { created_at: 'DESC' },
      });

      if (!lastVote || !newCountry) {
        return { hasAnomaly: false, riskScore: 0, description: 'No previous vote to compare' };
      }

      // Get time since last vote
      const timeDiff = Date.now() - lastVote.created_at.getTime();
      const hoursPassed = timeDiff / (1000 * 60 * 60);

      // If same country, no anomaly
      if (lastVote.voter_country === newCountry) {
        return { hasAnomaly: false, riskScore: 0, description: 'Same country' };
      }

      // Different country - check if travel is physically possible
      // Simplified: assume minimum 2 hours travel time between continents
      if (hoursPassed < 2) {
        await this.logAnomaly(
          lastVote.device_id || 0,
          this.ANOMALY_TYPES.LOCATION_JUMP,
          0.9,
          `Impossible travel: ${lastVote.voter_country} to ${newCountry} in ${hoursPassed.toFixed(1)} hours`
        );

        return {
          hasAnomaly: true,
          anomalyType: this.ANOMALY_TYPES.LOCATION_JUMP,
          riskScore: 0.9,
          description: `Impossible travel detected: ${lastVote.voter_country} to ${newCountry}`,
        };
      }

      return { hasAnomaly: false, riskScore: 0, description: 'Travel time reasonable' };
    } catch (error) {
      this.logger.error(`Error checking location jump: ${(error as Error).message}`);
      return { hasAnomaly: false, riskScore: 0, description: 'Error checking location' };
    }
  }

  /**
   * Check for timezone change
   */
  private async checkTimezoneChange(deviceId: number, newTimezone: string): Promise<AnomalyResult> {
    try {
      const device = await this.deviceRepository.findOne({
        where: { id: deviceId },
      });

      if (!device) {
        return { hasAnomaly: false, riskScore: 0, description: 'Device not found' };
      }

      // If no previous timezone, store current
      if (!device.timezone) {
        await this.deviceRepository.update(deviceId, { timezone: newTimezone });
        return { hasAnomaly: false, riskScore: 0, description: 'First timezone recorded' };
      }

      // Check if timezone changed
      if (device.timezone !== newTimezone) {
        await this.logAnomaly(
          deviceId,
          this.ANOMALY_TYPES.TIMEZONE_CHANGE,
          0.5,
          `Timezone changed from ${device.timezone} to ${newTimezone}`
        );

        await this.deviceRepository.update(deviceId, { timezone: newTimezone });

        return {
          hasAnomaly: true,
          anomalyType: this.ANOMALY_TYPES.TIMEZONE_CHANGE,
          riskScore: 0.5,
          description: `Timezone changed: ${device.timezone} → ${newTimezone}`,
        };
      }

      return { hasAnomaly: false, riskScore: 0, description: 'Timezone unchanged' };
    } catch (error) {
      this.logger.error(`Error checking timezone change: ${(error as Error).message}`);
      return { hasAnomaly: false, riskScore: 0, description: 'Error checking timezone' };
    }
  }

  /**
   * Check for rapid voting pattern (too many votes in short time)
   */
  private async checkRapidVotingPattern(userId: number): Promise<AnomalyResult> {
    try {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      // Check votes in last minute
      const votesLastMinute = await this.voteRepository.count({
        where: { 
          voter_id: userId,
          created_at: MoreThan(oneMinuteAgo),
        },
      });

      // Check votes in last 5 minutes
      const votesLast5Minutes = await this.voteRepository.count({
        where: { 
          voter_id: userId,
          created_at: MoreThan(fiveMinutesAgo),
        },
      });

      // More than 3 votes per minute = anomaly
      if (votesLastMinute > 3) {
        await this.logAnomaly(
          0,
          this.ANOMALY_TYPES.RAPID_VOTING,
          0.8,
          `${votesLastMinute} votes in the last minute`
        );

        return {
          hasAnomaly: true,
          anomalyType: this.ANOMALY_TYPES.RAPID_VOTING,
          riskScore: 0.8,
          description: `${votesLastMinute} votes in the last minute - too rapid`,
        };
      }

      // More than 10 votes per 5 minutes = anomaly
      if (votesLast5Minutes > 10) {
        await this.logAnomaly(
          0,
          this.ANOMALY_TYPES.RAPID_VOTING,
          0.6,
          `${votesLast5Minutes} votes in the last 5 minutes`
        );

        return {
          hasAnomaly: true,
          anomalyType: this.ANOMALY_TYPES.RAPID_VOTING,
          riskScore: 0.6,
          description: `${votesLast5Minutes} votes in the last 5 minutes`,
        };
      }

      return { hasAnomaly: false, riskScore: 0, description: 'Voting pattern normal' };
    } catch (error) {
      this.logger.error(`Error checking rapid voting: ${(error as Error).message}`);
      return { hasAnomaly: false, riskScore: 0, description: 'Error checking pattern' };
    }
  }

  /**
   * Check for unusual voting pattern (same contestant repeatedly)
   */
  private async checkUnusualPattern(userId: number): Promise<AnomalyResult> {
    try {
      // Get last 10 votes
      const recentVotes = await this.voteRepository.find({
        where: { voter_id: userId },
        order: { created_at: 'DESC' },
        take: 10,
      });

      if (recentVotes.length < 5) {
        return { hasAnomaly: false, riskScore: 0, description: 'Not enough votes to analyze' };
      }

      // Check if mostly voting for same contestant
      const contestantVotes: Record<number, number> = {};
      for (const vote of recentVotes) {
        contestantVotes[vote.contestant_id] = (contestantVotes[vote.contestant_id] || 0) + 1;
      }

      const maxVotesForContestant = Math.max(...Object.values(contestantVotes));
      const ratio = maxVotesForContestant / recentVotes.length;

      // If 80%+ votes for same contestant in last 10 votes
      if (ratio >= 0.8) {
        const dominantContestant = Object.keys(contestantVotes).find(
          key => contestantVotes[Number(key)] === maxVotesForContestant
        );

        await this.logAnomaly(
          recentVotes[0]?.device_id || 0,
          this.ANOMALY_TYPES.UNUSUAL_PATTERN,
          0.4,
          `${(ratio * 100).toFixed(0)}% votes for same contestant`
        );

        return {
          hasAnomaly: true,
          anomalyType: this.ANOMALY_TYPES.UNUSUAL_PATTERN,
          riskScore: 0.4,
          description: `Unusual pattern: ${(ratio * 100).toFixed(0)}% votes for same contestant`,
        };
      }

      return { hasAnomaly: false, riskScore: 0, description: 'Voting pattern diverse' };
    } catch (error) {
      this.logger.error(`Error checking unusual pattern: ${(error as Error).message}`);
      return { hasAnomaly: false, riskScore: 0, description: 'Error checking pattern' };
    }
  }

  /**
   * Check for IP address change
   */
  private async checkIPChange(userId: number, newIP: string): Promise<AnomalyResult> {
    try {
      // Get last vote IP
      const lastVote = await this.voteRepository.findOne({
        where: { voter_id: userId },
        order: { created_at: 'DESC' },
      });

      if (!lastVote || !lastVote.ip_address) {
        return { hasAnomaly: false, riskScore: 0, description: 'No previous IP to compare' };
      }

      // Check if IP changed
      if (lastVote.ip_address !== newIP) {
        // Check time since last vote
        const timeDiff = Date.now() - lastVote.created_at.getTime();
        const minutesPassed = timeDiff / (1000 * 60);

        // If IP changed within 5 minutes, it's suspicious
        if (minutesPassed < 5) {
          await this.logAnomaly(
            lastVote.device_id || 0,
            this.ANOMALY_TYPES.IP_CHANGE,
            0.7,
            `IP changed from ${lastVote.ip_address} to ${newIP} within ${minutesPassed.toFixed(1)} minutes`
          );

          return {
            hasAnomaly: true,
            anomalyType: this.ANOMALY_TYPES.IP_CHANGE,
            riskScore: 0.7,
            description: `IP changed rapidly: ${lastVote.ip_address} → ${newIP}`,
          };
        }
      }

      return { hasAnomaly: false, riskScore: 0, description: 'IP change acceptable' };
    } catch (error) {
      this.logger.error(`Error checking IP change: ${(error as Error).message}`);
      return { hasAnomaly: false, riskScore: 0, description: 'Error checking IP' };
    }
  }

  /**
   * Log an anomaly to database
   */
  async logAnomaly(
    deviceId: number,
    anomalyType: string,
    riskScore: number,
    description: string,
  ): Promise<void> {
    try {
      const anomaly = this.anomalyRepository.create({
        device_id: deviceId,
        anomaly_type: anomalyType,
        risk_score: riskScore,
        description,
        is_flagged: riskScore >= 0.7,
        flagged_at: riskScore >= 0.7 ? new Date() : undefined,
        anomaly_data: {
          detected_at: new Date().toISOString(),
        },
      });

      await this.anomalyRepository.save(anomaly);
      this.logger.log(`Anomaly logged: ${anomalyType} - ${description}`);
    } catch (error) {
      this.logger.error(`Error logging anomaly: ${(error as Error).message}`);
    }
  }

  /**
   * Get anomalies for a device
   */
  async getDeviceAnomalies(deviceId: number, limit: number = 20): Promise<DeviceAnomalyEntity[]> {
    return this.anomalyRepository.find({
      where: { device_id: deviceId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get flagged anomalies
   */
  async getFlaggedAnomalies(limit: number = 50): Promise<DeviceAnomalyEntity[]> {
    return this.anomalyRepository.find({
      where: { is_flagged: true },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get anomaly statistics
   */
  async getAnomalyStats(): Promise<any> {
    const total = await this.anomalyRepository.count();
    const flagged = await this.anomalyRepository.count({
      where: { is_flagged: true },
    });

    // Count by type
    const byType = await this.anomalyRepository
      .createQueryBuilder('a')
      .select('a.anomaly_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.anomaly_type')
      .getRawMany();

    return {
      totalAnomalies: total,
      flaggedAnomalies: flagged,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

// Helper function for MoreThan import
function MoreThan(date: Date): any {
  return { $gt: date };
}
