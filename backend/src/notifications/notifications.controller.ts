import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { extractAuthenticatedTenantId } from '@/common/helpers/tenant.helper';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '@/entities/notification.entity';
import { UserRole } from '@/entities/user.entity';

/**
 * Admin Notifications Controller
 */
@Controller('admin/notifications')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class NotificationsAdminController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get all notifications
   * GET /api/v1/admin/notifications
   * Access: Admin
   */
  @Get()
  async getAllNotifications(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const result = await this.notificationsService.getAllNotifications(page, limit, tenantId);
    return {
      statusCode: 200,
      message: 'Notifications retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Send notification to specific user
   * POST /api/v1/admin/notifications/send
   * Access: Admin
   */
  @Post('send')
  async sendNotification(
    @Body() sendDto: {
      userId?: number;
      role?: string;
      title: string;
      message: string;
      type?: NotificationType;
      relatedEntityType?: string;
      relatedEntityId?: number;
    },
    @Request() req: any,
  ) {
    const notification = await this.notificationsService.sendNotification(
      sendDto.userId,
      sendDto.role,
      sendDto.title,
      sendDto.message,
      req.user.id,
      sendDto.type || NotificationType.SYSTEM_ALERT,
      sendDto.relatedEntityType,
      sendDto.relatedEntityId,
    );
    return {
      statusCode: 201,
      message: 'Notification sent successfully',
      data: notification,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Broadcast to all users of a specific role
   * POST /api/v1/admin/notifications/broadcast/role
   * Access: Admin
   * 
   * Example body:
   * {
   *   "role": "contestant",
   *   "title": "Event Update",
   *   "message": "Voting ends tomorrow!",
   *   "type": "event_update"
   * }
   */
  @Post('broadcast/role')
  async broadcastToRole(
    @Body() broadcastDto: {
      role: string;
      title: string;
      message: string;
      type?: NotificationType;
    },
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const result = await this.notificationsService.broadcastToRole(
      broadcastDto.role,
      broadcastDto.title,
      broadcastDto.message,
      broadcastDto.type || NotificationType.SYSTEM_ALERT,
      tenantId,
    );
    return {
      statusCode: 200,
      message: `Broadcast completed: ${result.sent} sent, ${result.failed} failed`,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Broadcast to ALL active users
   * POST /api/v1/admin/notifications/broadcast/all
   * Access: Admin
   * 
   * Example body:
   * {
   *   "title": "System Maintenance",
   *   "message": "System will be down for maintenance at midnight",
   *   "type": "system_alert"
   * }
   */
  @Post('broadcast/all')
  async broadcastToAll(
    @Body() broadcastDto: {
      title: string;
      message: string;
      type?: NotificationType;
    },
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const result = await this.notificationsService.broadcastToAll(
      broadcastDto.title,
      broadcastDto.message,
      broadcastDto.type || NotificationType.SYSTEM_ALERT,
      tenantId,
    );
    return {
      statusCode: 200,
      message: `Broadcast completed: ${result.sent} sent, ${result.failed} failed`,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Mark notification as read
   * PATCH /api/v1/admin/notifications/:id/read
   * Access: Admin
   */
  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    const notification = await this.notificationsService.markAsRead(id);
    return {
      statusCode: 200,
      message: 'Notification marked as read',
      data: notification,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Delete notification
   * DELETE /api/v1/admin/notifications/:id
   * Access: Admin
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@Param('id', ParseIntPipe) id: number) {
    await this.notificationsService.deleteNotification(id);
    return {
      statusCode: 204,
      message: 'Notification deleted',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Contestant Notifications Controller
 */
@Controller('contestant/notifications')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.CONTESTANT, UserRole.ADMIN)
export class NotificationsContestantController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get my notifications
   * GET /api/v1/contestant/notifications
   * Access: Contestant
   */
  @Get()
  async getMyNotifications(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Request() req: any,
  ) {
    const result = await this.notificationsService.getUserNotifications(req.user.id, page, limit);
    return {
      statusCode: 200,
      message: 'Notifications retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get unread notification count
   * GET /api/v1/contestant/notifications/unread-count
   * Access: Contestant
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return {
      statusCode: 200,
      message: 'Unread count retrieved',
      data: { unreadCount: count },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Mark notification as read
   * PATCH /api/v1/contestant/notifications/:id/read
   * Access: Contestant
   */
  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const notification = await this.notificationsService.markAsReadForUser(id, req.user.id);
    return {
      statusCode: 200,
      message: 'Notification marked as read',
      data: notification,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Mark all as read
   * POST /api/v1/contestant/notifications/read-all
   * Access: Contestant
   */
  @Post('read-all')
  async markAllAsRead(@Request() req: any) {
    await this.notificationsService.markAllAsReadForUser(req.user.id);
    return {
      statusCode: 200,
      message: 'All notifications marked as read',
      timestamp: new Date().toISOString(),
    };
  }
}

@Controller('contestant')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.CONTESTANT, UserRole.ADMIN)
export class NotificationsPriorityController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /api/v1/contestant/notifications-priority
   * Access: Contestant
   */
  @Get('notifications-priority')
  async getPriorityNotifications(@Request() req: any) {
    const result = await this.notificationsService.getUserNotifications(req.user.id, 1, 50);
    const items = (result?.data ?? []).map((n: any) => ({
      id: String(n.id),
      title: n.title ?? 'Notification',
      message: n.message ?? '',
      priority: this.mapPriority(n.type),
      read: Boolean(n.read),
      timestamp: n.created_at
        ? new Date(n.created_at).toLocaleString('en-US')
        : new Date().toLocaleString('en-US'),
    }));

    return {
      statusCode: 200,
      message: 'Priority notifications retrieved successfully',
      data: items,
      timestamp: new Date().toISOString(),
    };
  }

  private mapPriority(type?: string): 'high' | 'medium' | 'low' {
    const normalized = String(type || '').toLowerCase();
    if (normalized.includes('security') || normalized.includes('fraud')) return 'high';
    if (normalized.includes('milestone') || normalized.includes('rank')) return 'medium';
    return 'low';
  }
}

/**
 * Public Notifications Controller
 * For voter notification lookup (read-only)
 */
@Controller('public/notifications')
export class PublicNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get notification by receipt ID (for voters)
   * GET /api/v1/public/notifications/receipt/:receiptId
   * Access: Public
   */
  @Get('receipt/:receiptId')
  async getNotificationByReceipt(@Param('receiptId') receiptId: string) {
    // This could be used to get notification about a vote
    // For now, just return a placeholder
    return {
      statusCode: 200,
      message: 'Receipt lookup available',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
