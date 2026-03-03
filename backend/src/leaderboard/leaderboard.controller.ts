import {
  Controller,
  Get,
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
import { OptionalJwtGuard } from '@/auth/guards/optional-jwt.guard';
import { extractAuthenticatedTenantId } from '@/common/helpers/tenant.helper';
import { LeaderboardService } from './leaderboard.service';

/**
 * Admin Leaderboard Controller
 * Full access for admin
 */
@Controller('admin/leaderboard')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class LeaderboardAdminController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * Get all leaderboard data
   * GET /api/v1/admin/leaderboard
   * Access: Admin
   */
  @Get()
  async getAllLeaderboardData(
    @Query('eventId', ParseIntPipe) eventId?: number,
    @Query('categoryId', ParseIntPipe) categoryId?: number,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.leaderboardService.getLeaderboard(eventId, categoryId, 100, tenantId);
    return {
      statusCode: 200,
      message: 'Leaderboard data retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get leaderboard by event
   * GET /api/v1/admin/leaderboard/event/:eventId
   * Access: Admin
   */
  @Get('event/:eventId')
  async getLeaderboardByEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.leaderboardService.getLeaderboard(eventId, undefined, 100, tenantId);
    return {
      statusCode: 200,
      message: 'Leaderboard data retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get leaderboard by category
   * GET /api/v1/admin/leaderboard/category/:categoryId
   * Access: Admin
   */
  @Get('category/:categoryId')
  async getLeaderboardByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.leaderboardService.getLeaderboardByCategory(categoryId, tenantId);
    return {
      statusCode: 200,
      message: 'Category leaderboard retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get leaderboard statistics
   * GET /api/v1/admin/leaderboard/stats
   * Access: Admin
   */
  @Get('stats')
  async getLeaderboardStats(
    @Query('eventId', ParseIntPipe) eventId: number,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const stats = await this.leaderboardService.getLeaderboardStats(eventId, tenantId);
    return {
      statusCode: 200,
      message: 'Leaderboard statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Public Leaderboard Controller
 * Read-only access
 */
@Controller('public/leaderboard')
@UseGuards(OptionalJwtGuard)
export class LeaderboardPublicController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * Get public leaderboard
   * GET /api/v1/public/leaderboard/:eventId
   * Access: Public
   */
  @Get(':eventId')
  async getPublicLeaderboard(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query('categoryId', ParseIntPipe) categoryId?: number,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.leaderboardService.getLeaderboard(eventId, categoryId, 100, tenantId);
    return {
      statusCode: 200,
      message: 'Leaderboard retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get public leaderboard by category
   * GET /api/v1/public/leaderboard/:eventId/category/:categoryId
   * Access: Public
   */
  @Get(':eventId/category/:categoryId')
  async getPublicLeaderboardByCategory(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.leaderboardService.getLeaderboardByCategory(categoryId, tenantId);
    return {
      statusCode: 200,
      message: 'Category leaderboard retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Public Leaderboard Root Controller
 * Backward-compatible route: GET /api/v1/leaderboard
 */
@Controller('leaderboard')
@UseGuards(OptionalJwtGuard)
export class LeaderboardRootController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboardRoot(
    @Query('eventId') eventId?: string,
    @Query('categoryId') categoryId?: string,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const parsedEventId = eventId ? parseInt(eventId, 10) : undefined;
    const parsedCategoryId = categoryId ? parseInt(categoryId, 10) : undefined;
    const data = await this.leaderboardService.getLeaderboard(
      parsedEventId,
      parsedCategoryId,
      100,
      tenantId,
    );
    return {
      statusCode: 200,
      message: 'Leaderboard retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Media Leaderboard Controller
 * Read-only access with more detail
 */
@Controller('media/leaderboard')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.MEDIA, UserRole.ADMIN)
export class LeaderboardMediaController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * Get media leaderboard
   * GET /api/v1/media/leaderboard
   * Access: Media
   */
  @Get()
  async getMediaLeaderboard(
    @Query('eventId', ParseIntPipe) eventId?: number,
    @Query('categoryId', ParseIntPipe) categoryId?: number,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.leaderboardService.getLeaderboard(eventId, categoryId, 100, tenantId);
    return {
      statusCode: 200,
      message: 'Media leaderboard retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get media category leaderboard
   * GET /api/v1/media/leaderboard/category/:categoryId
   * Access: Media
   */
  @Get('category/:categoryId')
  async getMediaCategoryLeaderboard(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.leaderboardService.getLeaderboardByCategory(categoryId, tenantId);
    return {
      statusCode: 200,
      message: 'Category leaderboard retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get vote trends
   * GET /api/v1/media/leaderboard/trends/:eventId
   * Access: Media
   */
  @Get('trends/:eventId')
  async getVoteTrends(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const trends = await this.leaderboardService.getVoteTrends(eventId, tenantId);
    return {
      statusCode: 200,
      message: 'Vote trends retrieved successfully',
      data: trends,
      timestamp: new Date().toISOString(),
    };
  }
}
