import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceFingerprintEntity } from '@/entities/device-fingerprint.entity';
import { DeviceEntity } from '@/entities/device.entity';
import * as crypto from 'crypto';

export interface DeviceFingerprint {
  fingerprint: string;
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  fontHash: string;
  firmwareHash: string;
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean;
}

export interface FingerprintResult {
  fingerprint: string;
  isNewDevice: boolean;
  deviceId: number | null;
  riskScore: number;
}

@Injectable()
export class DeviceFingerprintService {
  private readonly logger = new Logger(DeviceFingerprintService.name);

  constructor(
    @InjectRepository(DeviceFingerprintEntity)
    private fingerprintRepository: Repository<DeviceFingerprintEntity>,
    @InjectRepository(DeviceEntity)
    private deviceRepository: Repository<DeviceEntity>,
  ) {}

  /**
   * Generate a unique device fingerprint from client data
   */
  generateFingerprint(data: Partial<DeviceFingerprint>): string {
    // Create a composite hash from multiple fingerprint components
    const components = [
      data.canvasFingerprint || '',
      data.webglFingerprint || '',
      data.audioFingerprint || '',
      data.fontHash || '',
      data.firmwareHash || '',
      data.userAgent || '',
      data.platform || '',
      data.screenResolution || '',
      data.timezone || '',
    ].join('|');

    // Use SHA-256 for secure fingerprint generation
    return crypto.createHash('sha256').update(components).digest('hex');
  }

  /**
   * Create canvas fingerprint (browser-specific)
   */
  async createCanvasFingerprint(): Promise<string> {
    // This would be called from frontend to generate canvas fingerprint
    // Return a placeholder - actual implementation happens client-side
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Check if device exists, create if new
   */
  async checkDevice(data: Partial<DeviceFingerprint>): Promise<FingerprintResult> {
    try {
      const fingerprint = this.generateFingerprint(data);

      // Check if this fingerprint already exists
      const existingFingerprint = await this.fingerprintRepository.findOne({
        where: { canvas_fingerprint: data.canvasFingerprint },
        relations: ['device'],
      });

      if (existingFingerprint && existingFingerprint.device) {
        // Known device
        return {
          fingerprint,
          isNewDevice: false,
          deviceId: existingFingerprint.device.id,
          riskScore: 0,
        };
      }

      // New device - create it
      const newDevice = await this.deviceRepository.save({
        device_fingerprint: fingerprint,
        device_name: data.platform || 'Unknown',
        device_type: this.detectDeviceType(data.userAgent),
        is_mobile: this.isMobileDevice(data.userAgent),
        is_verified: false,
        first_seen: new Date(),
        last_active: new Date(),
      });

      // Create fingerprint record
      await this.fingerprintRepository.save({
        device_id: newDevice.id,
        fingerprint_hash: fingerprint,
        canvas_fingerprint: data.canvasFingerprint,
        webgl_fingerprint: data.webglFingerprint,
        audio_fingerprint: data.audioFingerprint,
        font_hash: data.fontHash,
        screen_resolution: data.screenResolution,
        timezone: data.timezone,
        language: data.language,
        plugins: data.platform || null,
        confidence_score: 0.9,
      });

      this.logger.log(`New device registered: ${newDevice.id}`);

      return {
        fingerprint,
        isNewDevice: true,
        deviceId: newDevice.id,
        riskScore: 0.3, // New devices have slightly higher risk
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error checking device: ${message}`);
      return {
        fingerprint: '',
        isNewDevice: true,
        deviceId: null,
        riskScore: 1.0, // Error = high risk
      };
    }
  }

  /**
   * Update device activity
   */
  async updateDeviceActivity(deviceId: number): Promise<void> {
    try {
      await this.deviceRepository.update(deviceId, {
        last_active: new Date(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating device activity: ${message}`);
    }
  }

  /**
   * Mark device as verified
   */
  async verifyDevice(deviceId: number): Promise<void> {
    try {
      await this.deviceRepository.update(deviceId, {
        is_verified: true,
        verified_at: new Date(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error verifying device: ${message}`);
    }
  }

  /**
   * Get device by ID
   */
  async getDevice(deviceId: number): Promise<DeviceEntity | null> {
    return this.deviceRepository.findOne({ where: { id: deviceId } });
  }

  /**
   * Get fingerprint by ID
   */
  async getFingerprint(fingerprintId: number): Promise<DeviceFingerprintEntity | null> {
    return this.fingerprintRepository.findOne({ where: { id: fingerprintId } });
  }

  /**
   * Detect device type from user agent
   */
  private detectDeviceType(userAgent: string | undefined): string {
    if (!userAgent) return 'Unknown';
    
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
      return 'Mobile';
    }
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      return 'Tablet';
    }
    return 'Desktop';
  }

  /**
   * Check if device is mobile
   */
  private isMobileDevice(userAgent: string | undefined): boolean {
    if (!userAgent) return false;
    return /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(): Promise<any> {
    const totalDevices = await this.deviceRepository.count();
    const verifiedDevices = await this.deviceRepository.count({
      where: { is_verified: true },
    });
    const mobileDevices = await this.deviceRepository.count({
      where: { is_mobile: true },
    });

    return {
      totalDevices,
      verifiedDevices,
      unverifiedDevices: totalDevices - verifiedDevices,
      mobileDevices,
      desktopDevices: totalDevices - mobileDevices,
      verificationRate: totalDevices > 0 
        ? ((verifiedDevices / totalDevices) * 100).toFixed(2) + '%'
        : '0%',
    };
  }
}
