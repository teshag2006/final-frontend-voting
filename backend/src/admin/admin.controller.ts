import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/entities/user.entity';
import { AdminDashboardService } from './admin-dashboard.service';

/**
 * Admin Dashboard Controller
 * GET /admin/dashboard — aggregated metrics matching frontend admin-overview-mock.ts
 */
@Controller('admin/dashboard')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  /**
   * GET /admin/dashboard
   * Returns all dashboard widgets in a single request:
   *   systemMetrics, voteActivity, revenueAnalytics, fraudSummary,
   *   deviceRisk, blockchainStatus, systemFeed
   */
  @Get()
  async getDashboard(
    @Query('range') range: '24h' | '7d' = '24h',
    @Request() req?: any,
  ) {
    const data = await this.adminDashboardService.getDashboard(range);
    return {
      statusCode: 200,
      message: 'Admin dashboard retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /admin/dashboard/metrics
   * Returns just the system metrics card values
   */
  @Get('metrics')
  async getSystemMetrics() {
    const data = await this.adminDashboardService.getSystemMetrics();
    return {
      statusCode: 200,
      message: 'System metrics retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /admin/dashboard/vote-activity
   * Returns vote activity chart data (24h or 7d)
   */
  @Get('vote-activity')
  async getVoteActivity(@Query('range') range: '24h' | '7d' = '24h') {
    const data = await this.adminDashboardService.getVoteActivity(range);
    return {
      statusCode: 200,
      message: 'Vote activity retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /admin/dashboard/revenue
   * Returns revenue analytics by provider
   */
  @Get('revenue')
  async getRevenueAnalytics() {
    const data = await this.adminDashboardService.getRevenueAnalytics();
    return {
      statusCode: 200,
      message: 'Revenue analytics retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
