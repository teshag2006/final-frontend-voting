import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VpnDetectionEntity } from '@/entities/vpn-detection.entity';
import { SuspiciousIPReputationEntity, IPThreatLevel } from '@/entities/suspicious-ip-reputation.entity';

export interface VPNDetectionResult {
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  isVPNOrProxy: boolean;
  provider?: string;
  confidence: number;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  country?: string;
  city?: string;
}

export interface IPGeolocationResult {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  isp: string;
  org: string;
  asn: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class VPNDetectionService {
  private readonly logger = new Logger(VPNDetectionService.name);
  
  // Known VPN provider patterns
  private readonly vpnProviders = [
    'nordvpn', 'expressvpn', 'surfshark', 'cyberghost', 'hotspotshield',
    'ipvanish', 'purevpn', 'privatevpn', 'strongvpn', 'vyprvpn',
    'mullvad', 'protonvpn', 'windscribe', 'tunnelbear', 'hide.me',
    'fastestvpn', 'securitykiss', 'vpnbook', 'freevpn', 'hidemyass',
    'torguard', 'ivpn', 'mythesau', 'perfect-privacy', 'vpn.ac',
    'azirevpn', 'blackvpn', 'cactusvpn', 'cryptostorm', 'disconnect.me',
    'enter.vpn', 'f-secure', 'frootvpn', 'getsociall', 'goosevpn',
    'hamachivpn', 'hideipvpn', 'ibvpn', 'internetshield', 'ipredator',
    'itshidden', 'k lept m', 'leap', 'logmein', 'mayaknet',
    'monovpn', 'moonvpn', 'netsekure', 'ovpn', 'rabbithole',
    'securevpn', 'spotflux', 'supervpn', 'swissvpn', 'tautvpn',
    'thinkmobile', 'unseenonline', 'vpnbook', 'vpnclick', 'vpngate',
    'vpnguru', 'vpnjack', 'vpnland', 'vpnment', 'vpnreactor',
    'vpnsafety', 'vpntraffic', 'wansee', 'whoer', 'zoogvpn',
  ];

  // Known hosting/cloud providers that might be used as VPN
  private readonly hostingProviders = [
    'aws', 'google cloud', 'azure', 'digitalocean', 'linode',
    'vultr', 'OVH', 'hostinger', 'namecheap', 'bluehost',
    'godaddy', 'hostgator', 'dreamhost', 'hostpapa', 'ipage',
    'singledomain', 'domain.com', 'register.com', 'networksolutions',
    'webs.com', 'weebly', 'wordpress', 'wix', 'squarespace',
  ];

  constructor(
    @InjectRepository(VpnDetectionEntity)
    private vpnDetectionRepository: Repository<VpnDetectionEntity>,
    @InjectRepository(SuspiciousIPReputationEntity)
    private suspiciousIpRepository: Repository<SuspiciousIPReputationEntity>,
  ) {}

  /**
   * Main method to detect VPN/Proxy/Tor
   * Checks multiple sources and returns comprehensive result
   */
  async detectVPN(ipAddress: string): Promise<VPNDetectionResult> {
    try {
      // Skip localhost and private IPs
      if (this.isPrivateIP(ipAddress)) {
        return this.createResult(false, false, false, 0, 'low');
      }

      // 1. Check local suspicious IP database
      const suspiciousResult = await this.checkSuspiciousDatabase(ipAddress);
      if (suspiciousResult) {
        return suspiciousResult;
      }

      // 2. Check local VPN database
      const vpnDbResult = await this.checkVPNDatabase(ipAddress);
      if (vpnDbResult) {
        return vpnDbResult;
      }

      // 3. Use IP Geolocation service to detect hosting/VPN
      const geoResult = await this.checkIPGeolocation(ipAddress);
      if (geoResult) {
        const isHosting = this.isHostingProvider(geoResult);
        return this.createResult(
          isHosting,
          isHosting,
          false,
          isHosting ? 0.7 : 0,
          isHosting ? 'medium' : 'low',
          undefined,
          geoResult.country,
        );
      }

      // Default: assume not VPN if no data
      return this.createResult(false, false, false, 0, 'low');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error detecting VPN for IP ${ipAddress}: ${errorMessage}`);
      // Return safe default on error
      return this.createResult(false, false, false, 0, 'low');
    }
  }

  /**
   * Check suspicious IP reputation database
   */
  private async checkSuspiciousDatabase(ipAddress: string): Promise<VPNDetectionResult | null> {
    try {
      const record = await this.suspiciousIpRepository.findOne({
        where: { ip_address: ipAddress },
      });

      if (record) {
        const isVPN = record.is_blacklisted || record.threat_level === 'high' || record.threat_level === 'critical';
        const isProxy = record.threat_level === 'high' || record.threat_level === 'critical';
        
        return this.createResult(
          isVPN,
          isProxy,
          false, // Tor not tracked in this table
          0.8, // High confidence if in suspicious DB
          record.threat_level as 'low' | 'medium' | 'high' | 'critical',
        );
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error checking suspicious database: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Check local VPN database
   */
  private async checkVPNDatabase(ipAddress: string): Promise<VPNDetectionResult | null> {
    try {
      const record = await this.vpnDetectionRepository.findOne({
        where: { ip_address: ipAddress },
      });

      if (record) {
        return {
          isVPN: record.is_vpn_confirmed,
          isProxy: false,
          isTor: false,
          isVPNOrProxy: record.is_vpn_confirmed,
          provider: record.vpn_provider || undefined,
          confidence: Number(record.detection_confidence) || 0.9,
          threatLevel: record.is_vpn_confirmed ? 'high' : 'medium',
        };
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error checking VPN database: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Use IP Geolocation to detect hosting/VPN
   * In production, integrate with services like:
   * - IPHunter (recommended for VPN detection)
   * - AbstractAPI
   * - IPAPI
   */
  private async checkIPGeolocation(ipAddress: string): Promise<IPGeolocationResult | null> {
    try {
      // In production, call external API:
      // const apiKey = process.env.IP_GEOLOCATION_API_KEY;
      // const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      //   headers: { 'Authorization': `Bearer ${apiKey}` }
      // });
      
      // For now, return mock data for demonstration
      // Replace with actual API call in production
      this.logger.log(`Checking geolocation for IP: ${ipAddress}`);
      
      // TODO: Implement actual IP geolocation API call
      // Recommended: https://iphunter.com/ or https://ipapi.co/
      
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error checking IP geolocation: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Check if IP belongs to hosting provider (often used as VPN)
   */
  private isHostingProvider(geoResult: IPGeolocationResult): boolean {
    const isp = (geoResult.isp || '').toLowerCase();
    const org = (geoResult.org || '').toLowerCase();

    for (const provider of this.hostingProviders) {
      if (isp.includes(provider) || org.includes(provider)) {
        return true;
      }
    }

    return false;
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
   * Create standardized result object
   */
  private createResult(
    isVPN: boolean,
    isProxy: boolean,
    isTor: boolean,
    confidence: number,
    threatLevel: 'low' | 'medium' | 'high' | 'critical',
    provider?: string,
    country?: string,
  ): VPNDetectionResult {
    return {
      isVPN,
      isProxy,
      isTor,
      isVPNOrProxy: isVPN || isProxy,
      provider,
      confidence: confidence || (isVPN || isProxy ? 0.7 : 0),
      threatLevel: threatLevel || (isVPN || isProxy ? 'medium' : 'low'),
      country,
    };
  }

  /**
   * Determine if vote should be blocked based on VPN/Proxy settings
   */
  shouldBlockVote(
    vpnResult: VPNDetectionResult,
    blockVPN: boolean = true,
    blockProxy: boolean = true,
    blockTor: boolean = true,
  ): boolean {
    if (blockVPN && vpnResult.isVPN) return true;
    if (blockProxy && vpnResult.isProxy) return true;
    if (blockTor && vpnResult.isTor) return true;
    return false;
  }

  /**
   * Log VPN/Proxy detection for audit
   */
  async logDetection(
    ipAddress: string,
    vpnResult: VPNDetectionResult,
    voteId?: number,
  ): Promise<void> {
    try {
      // Save to detection log
      const detection = this.vpnDetectionRepository.create({
        vote_id: voteId ?? 0,
        device_id: 0,
        ip_address: ipAddress,
        vpn_provider: vpnResult.provider,
        detection_confidence: vpnResult.confidence,
        is_vpn_confirmed: vpnResult.isVPN,
        detected_at: new Date(),
      });

      await this.vpnDetectionRepository.save(detection);

      // Update suspicious IP reputation if threat detected
      if (vpnResult.threatLevel === 'high' || vpnResult.threatLevel === 'critical') {
        await this.updateSuspiciousReputation(ipAddress, vpnResult);
      }

      this.logger.log(
        `VPN Detection: IP=${ipAddress}, VPN=${vpnResult.isVPN}, ` +
        `Proxy=${vpnResult.isProxy}, Tor=${vpnResult.isTor}, ` +
        `Threat=${vpnResult.threatLevel}`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error logging VPN detection: ${errorMessage}`);
    }
  }

  /**
   * Update suspicious IP reputation
   */
  private async updateSuspiciousReputation(
    ipAddress: string,
    vpnResult: VPNDetectionResult,
  ): Promise<void> {
    try {
      let record = await this.suspiciousIpRepository.findOne({
        where: { ip_address: ipAddress },
      });

      if (record) {
        record.threat_level = vpnResult.threatLevel as IPThreatLevel;
        record.fraud_count = (record.fraud_count || 0) + 1;
        record.last_updated = new Date();
        await this.suspiciousIpRepository.save(record);
      } else {
        const newRecord = this.suspiciousIpRepository.create({
          ip_address: ipAddress,
          threat_level: vpnResult.threatLevel as IPThreatLevel,
          is_blacklisted: vpnResult.threatLevel === 'critical',
          fraud_count: 1,
          last_updated: new Date(),
        });
        await this.suspiciousIpRepository.save(newRecord);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating suspicious reputation: ${errorMessage}`);
    }
  }

  /**
   * Get VPN detection statistics
   */
  async getDetectionStats(): Promise<any> {
    try {
      const totalDetections = await this.vpnDetectionRepository.count();
      const vpnDetections = await this.vpnDetectionRepository.count({
        where: { is_vpn_confirmed: true },
      });
      const proxyDetections = 0;
      const torDetections = 0;
      const confirmedDetections = await this.vpnDetectionRepository.count({
        where: { is_vpn_confirmed: true },
      });

      return {
        totalDetections,
        vpnDetections,
        proxyDetections,
        torDetections,
        confirmedDetections,
        detectionRate: totalDetections > 0 
          ? ((vpnDetections + proxyDetections) / totalDetections * 100).toFixed(2) + '%'
          : '0%',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting detection stats: ${errorMessage}`);
      return {
        totalDetections: 0,
        vpnDetections: 0,
        proxyDetections: 0,
        torDetections: 0,
        confirmedDetections: 0,
        detectionRate: '0%',
      };
    }
  }

  /**
   * Get recent VPN detections (for admin dashboard)
   */
  async getRecentDetections(limit: number = 50): Promise<VpnDetectionEntity[]> {
    return this.vpnDetectionRepository.find({
      order: { detected_at: 'DESC' },
      take: limit,
    });
  }
}
