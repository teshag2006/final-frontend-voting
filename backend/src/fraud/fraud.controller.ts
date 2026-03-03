import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/entities/user.entity';
import { extractAuthenticatedTenantId } from '@/common/helpers/tenant.helper';
import { FraudService } from './fraud.service';

/**
 * Fraud Controller
 * Handles fraud detection and monitoring
 */
@Controller('admin/fraud')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  /**
   * Get fraud dashboard statistics
   * GET /api/v1/admin/fraud/dashboard
   * Access: Admin
   */
  @Get('dashboard')
  async getFraudDashboard(@Request() req: any) {
    const tenantId = extractAuthenticatedTenantId(req);
    const stats = await this.fraudService.getFraudDashboardStats(tenantId);
    return {
      statusCode: 200,
      message: 'Fraud dashboard statistics retrieved',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get fraud cases
   * GET /api/v1/admin/fraud/cases
   * Access: Admin
   */
  @Get('cases')
  async getFraudCases(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const result = await this.fraudService.getFraudCases(page, limit, severity, status, tenantId);
    return {
      statusCode: 200,
      message: 'Fraud cases retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get fraud case by ID
   * GET /api/v1/admin/fraud/cases/:id
   * Access: Admin
   */
  @Get('cases/:id')
  async getFraudCase(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const fraudCase = await this.fraudService.getFraudCaseById(id, tenantId);
    return {
      statusCode: 200,
      message: 'Fraud case retrieved',
      data: fraudCase,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Resolve fraud case
   * PATCH /api/v1/admin/fraud/cases/:id/resolve
   * Access: Admin
   */
  @Patch('cases/:id/resolve')
  async resolveFraudCase(
    @Param('id', ParseIntPipe) id: number,
    @Body() resolveDto: { resolution: string; action: string },
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const resolved = await this.fraudService.resolveFraudCase(
      id,
      resolveDto.resolution,
      resolveDto.action,
      req.user.id,
      tenantId,
    );
    return {
      statusCode: 200,
      message: 'Fraud case resolved',
      data: resolved,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get device reputation data
   * GET /api/v1/admin/fraud/devices
   * Access: Admin
   */
  @Get('devices')
  async getDeviceReputation(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.fraudService.getDeviceReputation(page, limit);
    return {
      statusCode: 200,
      message: 'Device reputation data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get velocity violations
   * GET /api/v1/admin/fraud/velocity
   * Access: Admin
   */
  @Get('velocity')
  async getVelocityViolations(
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
   * Get VPN detections
   * GET /api/v1/admin/fraud/vpn
   * Access: Admin
   */
  @Get('vpn')
  async getVpnDetections(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.fraudService.getVpnDetections(page, limit);
    return {
      statusCode: 200,
      message: 'VPN detections retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get trust score monitor data
   * GET /api/v1/admin/fraud/trust
   * Access: Admin
   */
  @Get('trust')
  async getTrustScoreMonitor(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.fraudService.getTrustScoreData(page, limit);
    return {
      statusCode: 200,
      message: 'Trust score data retrieved',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Run fraud detection on a vote
   * POST /api/v1/admin/fraud/detect
   * Access: Admin
   */
  @Post('detect')
  async detectFraud(
    @Body() detectDto: { voteId: number },
  ) {
    const result = await this.fraudService.detectFraud(detectDto.voteId);
    return {
      statusCode: 200,
      message: 'Fraud detection completed',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
