import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/entities/user.entity';
import { FraudService } from './fraud.service';
import { VPNDetectionService } from './services/vpn-detection.service';
import { VelocityCheckService } from './services/velocity-check.service';
import { DeviceReputationService } from './services/device-reputation.service';

/**
 * Media Fraud Controller
 * Read-only fraud statistics for media dashboard
 * JWT required (media role)
 */
@Controller('media/fraud')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.MEDIA, UserRole.ADMIN)
export class FraudMediaController {
  constructor(
    private readonly fraudService: FraudService,
    private readonly vpnDetectionService: VPNDetectionService,
    private readonly velocityCheckService: VelocityCheckService,
    private readonly deviceReputationService: DeviceReputationService,
  ) {}

  /**
   * GET /api/v1/media/fraud-summary
   * Aggregated fraud summary for media
   */
  @Get('summary')
  async getFraudSummary() {
    const stats = await this.fraudService.getFraudDashboardStats();
    const vpnStats = await this.vpnDetectionService.getDetectionStats();

    return {
      statusCode: 200,
      message: 'Fraud summary retrieved',
      data: {
        totalAlerts: stats.totalFraudCases,
        pendingAlerts: stats.pendingCases,
        resolvedAlerts: stats.resolvedCases,
        highSeverityAlerts: stats.highSeverity,
        vpnDetections: vpnStats.vpnDetections + vpnStats.proxyDetections,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/v1/media/fraud/device-risk
   * Device risk distribution for media
   */
  @Get('device-risk')
  async getDeviceRiskDistribution(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.fraudService.getDeviceReputation(page, limit);

    return {
      statusCode: 200,
      message: 'Device risk distribution retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/v1/media/fraud/velocity
   * Velocity violation trends for media
   */
  @Get('velocity')
  async getVelocityTrends(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.fraudService.getVelocityViolations(page, limit);

    return {
      statusCode: 200,
      message: 'Velocity violations retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/v1/media/fraud/vpn
   * VPN detection overview for media
   */
  @Get('vpn')
  async getVpnOverview(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const [stats, detections] = await Promise.all([
      this.vpnDetectionService.getDetectionStats(),
      this.fraudService.getVpnDetections(page, limit),
    ]);

    return {
      statusCode: 200,
      message: 'VPN detection overview retrieved',
      data: {
        stats,
        detections: detections.data,
      },
      pagination: detections.pagination,
      timestamp: new Date().toISOString(),
    };
  }
}
