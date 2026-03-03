import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { FraudRiskLevel, VoteEntity, VoteStatus } from '@/entities/vote.entity';
import { VpnDetectionEntity } from '@/entities/vpn-detection.entity';
import { SuspiciousIPReputationEntity } from '@/entities/suspicious-ip-reputation.entity';
import { DeviceReputationEntity } from '@/entities/device-reputation.entity';
import { DeviceFingerprintEntity } from '@/entities/device-fingerprint.entity';
import { FraudLogEntity, FraudSeverity } from '@/entities/fraud-log.entity';

/**
 * Fraud Detection Service
 * Multi-factor fraud scoring algorithm (0.0 - 1.0)
 *
 * Factors:
 * - Multiple Devices (0.15) - Same user, different devices
 * - Rapid Voting (0.20) - Velocity violations
 * - VPN/Proxy Detection (0.15) - VPN/Proxy usage
 * - IP Reputation (0.15) - Blacklist status
 * - Device Reputation (0.15) - Trust score
 * - Geographic Anomaly (0.10) - Impossible travel
 * - Behavioral Pattern (0.10) - Pattern matching
 */
@Injectable()
export class FraudDetectionService {
  constructor(
    @InjectRepository(VoteEntity)
    private votesRepository: Repository<VoteEntity>,
    @InjectRepository(VpnDetectionEntity)
    private vpnDetectionRepository: Repository<VpnDetectionEntity>,
    @InjectRepository(SuspiciousIPReputationEntity)
    private suspiciousIpRepository: Repository<SuspiciousIPReputationEntity>,
    @InjectRepository(DeviceReputationEntity)
    private deviceReputationRepository: Repository<DeviceReputationEntity>,
    @InjectRepository(DeviceFingerprintEntity)
    private deviceFingerprintRepository: Repository<DeviceFingerprintEntity>,
    @InjectRepository(FraudLogEntity)
    private fraudLogRepository: Repository<FraudLogEntity>,
  ) {}

  /**
   * Calculate comprehensive fraud score
   */
  async calculateFraudScore(
    userId: number | null,
    ipAddress: string,
    deviceId?: number | null,
    deviceFingerprint?: string,
  ): Promise<{ score: number; level: FraudRiskLevel; reasons: string[] }> {
    const reasons: string[] = [];
    let score = 0;

    // Factor 1: Check for multiple devices (0.15 weight)
    const deviceScore = await this.checkMultipleDevices(userId);
    score += deviceScore * 0.15;
    if (deviceScore > 0.5) reasons.push('Multiple devices detected');

    // Factor 2: Check rapid voting velocity (0.20 weight)
    const velocityScore = await this.checkRapidVoting(userId, deviceId ?? null);
    score += velocityScore * 0.2;
    if (velocityScore > 0.6) reasons.push('Rapid voting pattern detected');

    // Factor 3: Check VPN/Proxy/Tor (0.15 weight)
    const vpnScore = await this.checkVPNProxy(ipAddress);
    score += vpnScore * 0.15;
    if (vpnScore > 0.5) reasons.push('VPN/Proxy/Tor detected');

    // Factor 4: Check IP reputation (0.15 weight)
    const ipScore = await this.checkIPReputation(ipAddress);
    score += ipScore * 0.15;
    if (ipScore > 0.6) reasons.push('Suspicious IP address');

    // Factor 5: Device reputation (0.15 weight)
    const deviceRepScore = await this.checkDeviceReputation(deviceId ?? null, deviceFingerprint);
    score += deviceRepScore * 0.15;
    if (deviceRepScore > 0.6) reasons.push('Low device trust score');

    // Factor 6: Geographic anomaly (0.10 weight)
    const geoScore = await this.checkGeographicAnomaly(userId);
    score += geoScore * 0.1;
    if (geoScore > 0.5) reasons.push('Geographic velocity anomaly');

    // Determine risk level
    let level: FraudRiskLevel;
    if (score < 0.3) level = FraudRiskLevel.LOW;
    else if (score < 0.6) level = FraudRiskLevel.MEDIUM;
    else level = FraudRiskLevel.HIGH;

    return { score: Math.min(score, 1.0), level, reasons };
  }

  /**
   * Check for VPN/Proxy/Tor usage (0.15 weight)
   * Queries the vpn_detections table
   */
  private async checkVPNProxy(ipAddress: string): Promise<number> {
    try {
      // Skip localhost and private IPs
      if (this.isPrivateIP(ipAddress)) {
        return 0;
      }

      // Check local VPN database
      const vpnRecord = await this.vpnDetectionRepository.findOne({
        where: { ip_address: ipAddress },
      });

      if (vpnRecord) {
        // If VPN is confirmed, high risk
        if (vpnRecord.is_vpn_confirmed) {
          return 1.0;
        }
        // If VPN detected but not confirmed
        if (vpnRecord.is_vpn || vpnRecord.is_proxy || vpnRecord.is_tor) {
          const confidence = Number(vpnRecord.detection_confidence) || 0.7;
          return confidence;
        }
      }

      // Not found in VPN database = assume not VPN (return low score)
      return 0;
    } catch (error) {
      console.error('Error checking VPN/Proxy:', error);
      return 0;
    }
  }

  /**
   * Check if IP is private/local
   */
  private isPrivateIP(ip: string): boolean {
    const parts = ip.split('.');
    if (parts.length !== 4) return true;

    const first = parseInt(parts[0], 10);
    const second = parseInt(parts[1], 10);

    // 10.x.x.x
    if (first === 10) return true;

    // 172.16.x.x - 172.31.x.x
    if (first === 172 && second >= 16 && second <= 31) return true;

    // 192.168.x.x
    if (first === 192 && second === 168) return true;

    // 127.x.x.x (localhost)
    if (first === 127) return true;

    return false;
  }

  /**
   * Check for multiple devices (same user, different devices)
   * Returns score from 0-1 based on device count in last 24h
   */
  private async checkMultipleDevices(userId: number | null): Promise<number> {
    if (!userId) return 0;

    try {
      // Count distinct devices for this user in last 24 hours
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const deviceCount = await this.votesRepository
        .createQueryBuilder('v')
        .select('COUNT(DISTINCT v.device_id)', 'count')
        .where('v.voter_id = :userId', { userId })
        .andWhere('v.created_at > :twentyFourHoursAgo', { twentyFourHoursAgo })
        .andWhere('v.device_id IS NOT NULL')
        .getRawOne();

      const count = parseInt(deviceCount?.count || 0);

      // Scoring: 0 devices = 0.0, 1 device = 0.0, 2+ devices = 0.5, 5+ devices = 1.0
      if (count <= 1) return 0;
      if (count === 2) return 0.3;
      if (count === 3) return 0.5;
      if (count === 4) return 0.7;
      return 1.0;
    } catch (error) {
      console.error('Error checking multiple devices:', error);
      return 0;
    }
  }

  /**
   * Check rapid voting (velocity violations)
   * Rules:
   * - Max 3 votes per minute per user
   * - Max 10 votes per hour per device
   * - Max 50 votes per day per IP
   */
  private async checkRapidVoting(userId: number | null, deviceId: number | null): Promise<number> {
    try {
      let velocityScore = 0;

      // Check per-user velocity (3 votes per minute)
      if (userId) {
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        await this.votesRepository.count({
          where: {
            voter_id: userId,
            created_at: LessThan(new Date()),
          },
        });

        // Simplified: count recent votes
        const userVotesLastMinute = await this.votesRepository
          .createQueryBuilder('v')
          .where('v.voter_id = :userId', { userId })
          .andWhere('v.created_at > :oneMinuteAgo', { oneMinuteAgo })
          .getCount();

        // Scoring: 0-3 votes = 0.0, 4-5 = 0.3, 6-8 = 0.6, 9+ = 1.0
        if (userVotesLastMinute > 8) velocityScore = Math.max(velocityScore, 1.0);
        else if (userVotesLastMinute > 5) velocityScore = Math.max(velocityScore, 0.6);
        else if (userVotesLastMinute > 3) velocityScore = Math.max(velocityScore, 0.3);
      }

      // Check per-device velocity (10 votes per hour)
      if (deviceId) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const deviceVotesLastHour = await this.votesRepository
          .createQueryBuilder('v')
          .where('v.device_id = :deviceId', { deviceId })
          .andWhere('v.created_at > :oneHourAgo', { oneHourAgo })
          .getCount();

        // Scoring: 0-10 votes = 0.0, 11-15 = 0.3, 16-20 = 0.6, 21+ = 1.0
        if (deviceVotesLastHour > 20) velocityScore = Math.max(velocityScore, 1.0);
        else if (deviceVotesLastHour > 15) velocityScore = Math.max(velocityScore, 0.6);
        else if (deviceVotesLastHour > 10) velocityScore = Math.max(velocityScore, 0.3);
      }

      return velocityScore;
    } catch (error) {
      console.error('Error checking rapid voting:', error);
      return 0;
    }
  }

  /**
   * Check IP reputation (blacklist check)
   * Queries suspicious_ip_reputation table
   */
  private async checkIPReputation(ipAddress: string): Promise<number> {
    try {
      // Query database for IP reputation
      const ipRecord = await this.suspiciousIpRepository.findOne({
        where: { ip_address: ipAddress },
      });

      if (!ipRecord) {
        // Not found in database = slightly suspicious (new/unknown IP)
        return 0.1;
      }

      // Scoring based on threat level and blacklist status
      let score = 0;

      // If blacklisted = automatic high risk
      if (ipRecord.is_blacklisted) {
        return 1.0;
      }

      // Score based on threat level
      switch (ipRecord.threat_level) {
        case 'critical':
          score = 1.0;
          break;
        case 'high':
          score = 0.8;
          break;
        case 'medium':
          score = 0.4;
          break;
        case 'low':
          score = 0.1;
          break;
        default:
          score = 0.0;
      }

      // Adjust based on fraud count
      if (ipRecord.fraud_count && ipRecord.fraud_count > 5) {
        score = Math.min(1.0, score + 0.1 * Math.min(ipRecord.fraud_count - 5, 3));
      }

      return score;
    } catch (error) {
      console.error('Error checking IP reputation:', error);
      return 0;
    }
  }

  /**
   * Check device reputation (trust score)
   * Queries device_reputation table for trust score (0-1)
   */
  private async checkDeviceReputation(
    deviceId: number | null,
    deviceFingerprint?: string,
  ): Promise<number> {
    try {
      if (deviceId) {
        const deviceRecord = await this.deviceReputationRepository.findOne({
          where: { device_id: deviceId },
        });
        if (!deviceRecord) return 0.3;
        return this.calculateRiskFromTrustScore(deviceRecord);
      }

      if (!deviceFingerprint) {
        return 0.3;
      }

      // First, try to find the device by fingerprint
      // The fingerprint is a SHA-256 hash, but we store individual components
      // Try to find via canvas_fingerprint which is the primary identifier
      const fingerprintRecord = await this.deviceFingerprintRepository.findOne({
        where: { canvas_fingerprint: deviceFingerprint },
        relations: ['device'],
      });

      // If no fingerprint record found, we cannot map to a device_id.
      if (!fingerprintRecord) {
        // Unknown device = medium suspicion
        return 0.3;
      }

      // Get the device ID from the fingerprint record
      const deviceIdFromFingerprint = fingerprintRecord.device_id;

      // Query database for device reputation using device ID
      const deviceRecord = await this.deviceReputationRepository.findOne({
        where: { device_id: deviceIdFromFingerprint },
      });

      if (!deviceRecord) {
        // Unknown device = medium suspicion
        return 0.3;
      }

      return this.calculateRiskFromTrustScore(deviceRecord);
    } catch (error) {
      console.error('Error checking device reputation:', error);
      return 0.3;
    }
  }

  /**
   * Calculate risk score from trust score
   * Maps trust score (0-1) to fraud risk (0-1)
   */
  private calculateRiskFromTrustScore(deviceRecord: DeviceReputationEntity): number {
    // Map trust score to fraud risk (inverse relationship)
    // High trust (0.8-1.0) = low risk (0.0)
    // Medium trust (0.5-0.8) = medium risk (0.3)
    // Low trust (0.0-0.5) = high risk (0.6-1.0)
    const trustScore = Number(deviceRecord.trust_score) || 1.0;
    let riskScore = 0;

    if (trustScore >= 0.8) {
      riskScore = 0.0;
    } else if (trustScore >= 0.5) {
      riskScore = 0.3;
    } else {
      riskScore = 0.6 + (0.5 - trustScore) * 0.8;
    }

    // Adjust based on fraud count
    if (deviceRecord.fraud_count && deviceRecord.fraud_count > 3) {
      riskScore = Math.min(1.0, riskScore + 0.1 * Math.min(deviceRecord.fraud_count - 3, 4));
    }

    return riskScore;
  }

  /**
   * Check geographic anomaly (impossible travel)
   * Compares current location with previous vote location
   * Calculates if travel distance is possible in given time
   */
  private async checkGeographicAnomaly(userId: number | null): Promise<number> {
    if (!userId) return 0;

    try {
      // Get the last vote for this user
      const lastVote = await this.votesRepository
        .createQueryBuilder('v')
        .where('v.voter_id = :userId', { userId })
        .orderBy('v.created_at', 'DESC')
        .limit(1)
        .getOne();

      if (!lastVote) return 0; // No previous vote, no anomaly

      // Calculate time passed since last vote (reserved for future GeoIP integration)
      // const timeSinceLastVote = Date.now() - lastVote.created_at.getTime();

      // TODO: Get geolocation from IP address (would require GeoIP service)
      // For now: placeholder implementation
      // Real implementation would:
      // 1. Get previous location from last vote
      // 2. Get current location from IP address (using MaxMind, IP2Location, etc.)
      // 3. Calculate great-circle distance between two points
      // 4. Calculate maximum possible distance in given time
      //    (assuming max speed of 900 km/h for commercial flights)
      // 5. If actual distance > possible distance = geographic anomaly

      // Placeholder: low score (geographic detection needs external API)
      return 0;
    } catch (error) {
      console.error('Error checking geographic anomaly:', error);
      return 0;
    }
  }

  /**
   * Determine vote status based on fraud score
   */
  getVoteStatus(fraudScore: number): VoteStatus {
    if (fraudScore < 0.3) return VoteStatus.VALID;
    if (fraudScore < 0.9) return VoteStatus.FRAUD_SUSPECTED;
    return VoteStatus.INVALID;
  }

  /**
   * Create fraud alert for suspicious votes — writes to fraud_logs table
   */
  async createFraudAlert(
    voteId: number,
    fraudScore: number,
    reasons: string[],
  ): Promise<void> {
    try {
      let severity: FraudSeverity;
      if (fraudScore >= 0.9) severity = FraudSeverity.CRITICAL;
      else if (fraudScore >= 0.7) severity = FraudSeverity.HIGH;
      else if (fraudScore >= 0.4) severity = FraudSeverity.MEDIUM;
      else severity = FraudSeverity.LOW;

      await this.fraudLogRepository.save({
        vote_id: voteId,
        fraud_type: reasons[0] || 'multi-factor',
        severity,
        fraud_score: fraudScore,
        description: reasons.join('; '),
        fraud_details: { reasons, calculatedAt: new Date().toISOString() },
        is_resolved: false,
      });
    } catch (error) {
      console.error(`Failed to persist fraud alert for vote ${voteId}:`, error);
    }
  }
}
