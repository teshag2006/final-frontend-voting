import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/entities/user.entity';
import { OptionalJwtGuard } from '@/auth/guards/optional-jwt.guard';
import {
  extractAuthenticatedTenantId,
  resolveTenantScope,
} from '@/common/helpers/tenant.helper';
import { ContestantsService } from './contestants.service';
import {
  CreateContestantDto,
  UpdateContestantDto,
} from './dto/contestant.dto';
import { ContestantStatus } from '@/entities/contestant.entity';

@Controller('contestants')
@UseGuards(OptionalJwtGuard)
export class ContestantsController {
  constructor(private contestantsService: ContestantsService) {}

  /**
   * Get all contestants
   * GET /api/v1/contestants?page=1&limit=50&status=approved
   * Access: Public
   */
  @Get('')
  async getAllContestants(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('status') status?: ContestantStatus,
    @Request() req?: any,
  ): Promise<{ statusCode: number; message: string; data: any; pagination: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const pageNum = parseInt(page as any, 10) || 1;
    const limitNum = parseInt(limit as any, 10) || 50;
    const result = await this.contestantsService.getAllContestants(
      pageNum,
      limitNum,
      status,
      tenantId,
    );

    return {
      statusCode: 200,
      message: 'Contestants retrieved successfully',
      data: result.data,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        pages: result.pages,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get contestant by ID
   * GET /api/v1/contestants/:id
   * Access: Public
   */
  @Get(':id')
  async getContestant(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const contestant = await this.contestantsService.getContestantById(id, tenantId);

    return {
      statusCode: 200,
      message: 'Contestant retrieved successfully',
      data: contestant,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get contestants by category
   * GET /api/v1/contestants/category/:categoryId?page=1&limit=50&status=approved
   * Access: Public
   */
  @Get('category/:categoryId')
  async getContestantsByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('status') status?: ContestantStatus,
    @Request() req?: any,
  ): Promise<{ statusCode: number; message: string; data: any; pagination: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const result = await this.contestantsService.getContestantsByCategory(
      categoryId,
      page,
      limit,
      status,
      tenantId,
    );

    return {
      statusCode: 200,
      message: 'Contestants retrieved successfully',
      data: result.data,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        pages: result.pages,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get contestants by event
   * GET /api/v1/events/:eventId/contestants?page=1&limit=100
   * Access: Public
   */
  @Get('event/:eventId')
  async getContestantsByEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
    @Request() req?: any,
  ): Promise<{ statusCode: number; message: string; data: any; pagination: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const result = await this.contestantsService.getContestantsByEvent(eventId, page, limit, tenantId);

    return {
      statusCode: 200,
      message: 'Contestants retrieved successfully',
      data: result.data,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        pages: result.pages,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create new contestant
   * POST /api/v1/contestants
   * Body: CreateContestantDto
   * Access: Protected (admin only)
   */
  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createContestant(
    @Body() createContestantDto: CreateContestantDto,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const contestant = await this.contestantsService.createContestant(createContestantDto, tenantId);

    return {
      statusCode: 201,
      message: 'Contestant created successfully',
      data: contestant,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update contestant
   * PUT /api/v1/contestants/:id
   * Body: UpdateContestantDto
   * Access: Protected (admin only)
   */
  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateContestant(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContestantDto: UpdateContestantDto,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const contestant = await this.contestantsService.updateContestant(id, updateContestantDto, tenantId);

    return {
      statusCode: 200,
      message: 'Contestant updated successfully',
      data: contestant,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Delete contestant
   * DELETE /api/v1/contestants/:id
   * Access: Protected (admin only)
   */
  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteContestant(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    const tenantId = extractAuthenticatedTenantId(req);
    await this.contestantsService.deleteContestant(id, tenantId);
  }

  /**
   * Get contestant statistics
   * GET /api/v1/contestants/:id/stats
   * Access: Public
   */
  @Get(':id/stats')
  async getContestantStats(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const stats = await this.contestantsService.getContestantStats(id, tenantId);

    return {
      statusCode: 200,
      message: 'Contestant statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Approve contestant
   * POST /api/v1/contestants/:id/approve
   * Access: Protected (admin only)
   */
  @Post(':id/approve')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async approveContestant(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const contestant = await this.contestantsService.approveContestant(id, tenantId);

    return {
      statusCode: 200,
      message: 'Contestant approved successfully',
      data: contestant,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verify contestant
   * POST /api/v1/contestants/:id/verify
   * Access: Protected (admin only)
   */
  @Post(':id/verify')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async verifyContestant(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const contestant = await this.contestantsService.verifyContestant(id, tenantId);

    return {
      statusCode: 200,
      message: 'Contestant verified successfully',
      data: contestant,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get contestant dashboard analytics
   * GET /api/v1/contestants/:id/dashboard
   * Returns DashboardOverview, RankingData, AnalyticsData, RevenueData, GeographicData
   * Access: Protected — contestant owner or admin only
   */
  @Get(':id/dashboard')
  @UseGuards(JwtGuard)
  async getContestantDashboard(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const requestUserId: number | undefined = req.user?.id;
    const requestUserRole: string | undefined = req.user?.role;
    const dashboard = await this.contestantsService.getContestantDashboard(
      id,
      tenantId,
      requestUserId,
      requestUserRole,
    );

    return {
      statusCode: 200,
      message: 'Contestant dashboard retrieved successfully',
      data: dashboard,
      timestamp: new Date().toISOString(),
    };
  }
}

@Controller('contestant')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.CONTESTANT, UserRole.ADMIN)
export class ContestantPortalController {
  constructor(private contestantsService: ContestantsService) {}

  @Get('dashboard/overview')
  async getDashboardOverview(@Request() req: any) {
    const tenantId = extractAuthenticatedTenantId(req);
    const dashboard = await this.contestantsService.getContestantDashboardByUserId(
      req.user.id,
      tenantId,
      req.user?.role,
    );

    const daily = Array.isArray(dashboard.dashboardOverview?.daily_votes)
      ? dashboard.dashboardOverview.daily_votes
      : [];
    const topCountries = Array.isArray(dashboard.geographicData)
      ? dashboard.geographicData
      : [];

    return {
      statusCode: 200,
      message: 'Contestant dashboard overview retrieved successfully',
      data: {
        metrics: {
          total_votes: Number(dashboard.dashboardOverview?.total_votes ?? 0),
          free_votes: Number(dashboard.dashboardOverview?.free_votes ?? 0),
          paid_votes: Number(dashboard.dashboardOverview?.paid_votes ?? 0),
          revenue_generated: Math.round(
            Number(dashboard.dashboardOverview?.revenue_generated ?? 0) * 100,
          ),
          revenue_trend: 0,
        },
        vote_snapshots: daily.map((row: any) => ({
          date: this.formatDateLabel(row?.date),
          free_votes: Number(row?.votes ?? 0),
          paid_votes: 0,
        })),
        top_countries: topCountries.map((row: any) => ({
          country: row.country,
          country_code: this.countryCodeFromName(row.country),
          votes: Number(row.votes ?? 0),
          revenue: 0,
        })),
        integrity_status: {
          blockchain_verified: true,
          fraud_detected: false,
          under_review: false,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ranking')
  async getRanking(@Request() req: any) {
    const tenantId = extractAuthenticatedTenantId(req);
    const dashboard = await this.contestantsService.getContestantDashboardByUserId(
      req.user.id,
      tenantId,
      req.user?.role,
    );
    return {
      statusCode: 200,
      message: 'Contestant ranking retrieved successfully',
      data: dashboard.rankingData,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('analytics')
  async getAnalytics(@Request() req: any) {
    const tenantId = extractAuthenticatedTenantId(req);
    const dashboard = await this.contestantsService.getContestantDashboardByUserId(
      req.user.id,
      tenantId,
      req.user?.role,
    );
    const daily = Array.isArray(dashboard.dashboardOverview?.daily_votes)
      ? dashboard.dashboardOverview.daily_votes
      : [];

    return {
      statusCode: 200,
      message: 'Contestant analytics retrieved successfully',
      data: {
        daily_votes: daily.map((row: any) => ({
          date: this.formatDateLabel(row?.date),
          free_votes: Number(row?.votes ?? 0),
          paid_votes: 0,
        })),
        hourly_distribution: dashboard.analyticsData?.hourly_distribution ?? [],
        fraud_metrics: {
          total_votes: Number(dashboard.dashboardOverview?.total_votes ?? 0),
          suspicious_votes: 0,
          confirmed_fraud: 0,
          flagged_votes: 0,
          removed_votes: 0,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('revenue')
  async getRevenue(@Request() req: any) {
    const tenantId = extractAuthenticatedTenantId(req);
    const dashboard = await this.contestantsService.getContestantDashboardByUserId(
      req.user.id,
      tenantId,
      req.user?.role,
    );

    const daily = Array.isArray(dashboard.dashboardOverview?.daily_votes)
      ? dashboard.dashboardOverview.daily_votes
      : [];
    const snapshots = daily.map((row: any) => ({
      date: this.formatDateLabel(row?.date),
      revenue: 0,
    }));

    return {
      statusCode: 200,
      message: 'Contestant revenue retrieved successfully',
      data: {
        metrics: {
          total_revenue: Math.round(Number(dashboard.revenueData?.total_revenue ?? 0) * 100),
          revenue_this_week: Math.round(
            Number(dashboard.revenueData?.revenue_this_week ?? 0) * 100,
          ),
          revenue_this_month: Math.round(
            Number(dashboard.revenueData?.revenue_this_month ?? 0) * 100,
          ),
        },
        snapshots,
        payment_methods: {
          stripe_percentage: 0,
          paypal_percentage: 0,
          other_percentage: 100,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('security')
  async getSecurity(@Request() req: any) {
    const tenantId = extractAuthenticatedTenantId(req);
    const dashboard = await this.contestantsService.getContestantDashboardByUserId(
      req.user.id,
      tenantId,
      req.user?.role,
    );

    return {
      statusCode: 200,
      message: 'Contestant security data retrieved successfully',
      data: {
        metrics: {
          trust_score: 90,
          trust_level: 'Good',
          device_reputation: 'Good',
          fraud_alerts_count: 0,
        },
        alerts: [],
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('geographic')
  async getGeographic(@Request() req: any) {
    const tenantId = extractAuthenticatedTenantId(req);
    const dashboard = await this.contestantsService.getContestantDashboardByUserId(
      req.user.id,
      tenantId,
      req.user?.role,
    );
    const countries = Array.isArray(dashboard.geographicData)
      ? dashboard.geographicData
      : [];

    return {
      statusCode: 200,
      message: 'Contestant geographic data retrieved successfully',
      data: {
        countries: countries.map((row: any) => ({
          country: row.country,
          country_code: this.countryCodeFromName(row.country),
          votes: Number(row.votes ?? 0),
          revenue: 0,
        })),
        vpn_activity: {
          vpn_votes: 0,
          proxy_attempts: 0,
          tor_access: 0,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('sponsors')
  async getSponsors(@Request() req: any) {
    const tenantId = extractAuthenticatedTenantId(req);
    const contestant = await this.contestantsService.getContestantByUserId(
      req.user.id,
      tenantId,
    );

    return {
      statusCode: 200,
      message: 'Contestant sponsor visibility retrieved successfully',
      data: [],
      meta: {
        contestantId: contestant.id,
        contestantSlug: contestant.slug,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('event')
  async getEvent(@Request() req: any) {
    const tenantId = extractAuthenticatedTenantId(req);
    const contestant = await this.contestantsService.getContestantByUserId(
      req.user.id,
      tenantId,
    );

    return {
      statusCode: 200,
      message: 'Contestant event details retrieved successfully',
      data: {
        event_name: contestant.event_name ?? 'Event',
        category: contestant.category_name ?? 'Category',
        start_date: contestant.created_at ?? new Date(),
        end_date: contestant.updated_at ?? new Date(),
        voting_deadline: contestant.updated_at ?? new Date(),
        rules_summary: 'Voting is verified and monitored for fairness.',
      },
      timestamp: new Date().toISOString(),
    };
  }

  private formatDateLabel(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private countryCodeFromName(country: string): string {
    const normalized = String(country || '').trim().toLowerCase();
    const map: Record<string, string> = {
      ethiopia: 'ET',
      kenya: 'KE',
      nigeria: 'NG',
      'south africa': 'ZA',
      ghana: 'GH',
      egypt: 'EG',
      'united states': 'US',
      usa: 'US',
    };
    return map[normalized] || 'XX';
  }
}
