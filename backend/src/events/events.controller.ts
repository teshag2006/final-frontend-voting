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
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import {
  extractAuthenticatedTenantId,
  parseOptionalTenantId,
  resolveTenantScope as resolveScope,
} from '@/common/helpers/tenant.helper';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/event.dto';
import { EventStatus } from '@/entities/event.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  /**
   * Get all events with optional filtering
   * GET /api/v1/events?page=1&limit=20&status=active&isPublic=true
   * Access: Public
   */
  @Get()
  @ApiOperation({ summary: 'List events with optional filters' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'status', required: false, enum: EventStatus })
  @ApiQuery({ name: 'isPublic', required: false, example: true })
  @ApiQuery({ name: 'tenantId', required: false, example: 1 })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async getAllEvents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: EventStatus,
    @Query('isPublic') isPublic?: string,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ statusCode: number; message: string; data: any; pagination: any; timestamp: string }> {
    const parsedPage = this.parsePositiveInt(page, 1);
    const parsedLimit = this.parsePositiveInt(limit, 20);
    const parsedTenantId = this.parseOptionalPositiveInt(tenantId);
    const parsedIsPublic =
      isPublic === undefined
        ? undefined
        : isPublic === 'true'
          ? true
          : isPublic === 'false'
            ? false
            : undefined;

    const result = await this.eventsService.getAllEvents(
      parsedPage,
      parsedLimit,
      status,
      parsedIsPublic,
      parsedTenantId,
    );

    return {
      statusCode: 200,
      message: 'Events retrieved successfully',
      data: result.data,
      pagination: {
        page: result.page,
        limit: parsedLimit,
        total: result.total,
        pages: result.pages,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get event by ID
   * GET /api/v1/events/:id
   * Access: Public
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiQuery({ name: 'tenantId', required: false, example: 1 })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEvent(
    @Param('id', ParseIntPipe) id: number,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const parsedTenantId = this.parseOptionalPositiveInt(tenantId);
    const event = await this.eventsService.getEventById(id, parsedTenantId);

    return {
      statusCode: 200,
      message: 'Event retrieved successfully',
      data: event,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create new event
   * POST /api/v1/events
   * Body: CreateEventDto
   * Access: Protected (admin only)
   */
  @Post()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    example: 1,
    description: 'Optional tenant scope. Must match authenticated tenant when present.',
  })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 403, description: 'Tenant scope mismatch' })
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Request() req: any,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const parsedTenantId = this.resolveTenantScope(req, tenantId);
    const event = await this.eventsService.createEvent(req.user.id, createEventDto, parsedTenantId);

    return {
      statusCode: 201,
      message: 'Event created successfully',
      data: event,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update event
   * PUT /api/v1/events/:id
   * Body: UpdateEventDto
   * Access: Protected (admin only)
   */
  @Put(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update an event' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    example: 1,
    description: 'Optional tenant scope. Must match authenticated tenant when present.',
  })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Tenant scope mismatch' })
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: any,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const parsedTenantId = this.resolveTenantScope(req, tenantId);
    const event = await this.eventsService.updateEvent(id, updateEventDto, parsedTenantId);

    return {
      statusCode: 200,
      message: 'Event updated successfully',
      data: event,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Delete event
   * DELETE /api/v1/events/:id
   * Access: Protected (admin only)
   */
  @Delete(':id')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    example: 1,
    description: 'Optional tenant scope. Must match authenticated tenant when present.',
  })
  @ApiResponse({ status: 204, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Tenant scope mismatch' })
  async deleteEvent(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Query('tenantId') tenantId?: string,
  ): Promise<void> {
    const parsedTenantId = this.resolveTenantScope(req, tenantId);
    await this.eventsService.deleteEvent(id, parsedTenantId);
  }

  /**
   * Get categories for event
   * GET /api/v1/events/:eventId/categories?page=1&limit=50
   * Access: Public
   */
  @Get(':eventId/categories')
  @ApiOperation({ summary: 'List categories for an event' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'tenantId', required: false, example: 1 })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getEventCategories(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ statusCode: number; message: string; data: any; pagination: any; timestamp: string }> {
    const parsedPage = this.parsePositiveInt(page, 1);
    const parsedLimit = this.parsePositiveInt(limit, 50);
    const parsedTenantId = this.parseOptionalPositiveInt(tenantId);
    const result = await this.eventsService.getCategoriesByEvent(
      eventId,
      parsedPage,
      parsedLimit,
      parsedTenantId,
    );

    return {
      statusCode: 200,
      message: 'Categories retrieved successfully',
      data: result.data,
      pagination: {
        page: result.page,
        limit: parsedLimit,
        total: result.total,
        pages: result.pages,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private parsePositiveInt(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(1, Math.trunc(parsed));
  }

  /**
   * Create category for event
   * POST /api/v1/events/categories
   * Body: CreateCategoryDto
   * Access: Protected (admin only)
   */
  @Post('categories')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create category for an event' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    example: 1,
    description: 'Optional tenant scope. Must match authenticated tenant when present.',
  })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Tenant scope mismatch' })
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: any,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const parsedTenantId = this.resolveTenantScope(req, tenantId);
    const category = await this.eventsService.createCategory(createCategoryDto, parsedTenantId);

    return {
      statusCode: 201,
      message: 'Category created successfully',
      data: category,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get category by ID
   * GET /api/v1/events/categories/:categoryId
   * Access: Public
   */
  @Get('categories/:categoryId')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiQuery({ name: 'tenantId', required: false, example: 1 })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const parsedTenantId = this.parseOptionalPositiveInt(tenantId);
    const category = await this.eventsService.getCategoryById(categoryId, parsedTenantId);

    return {
      statusCode: 200,
      message: 'Category retrieved successfully',
      data: category,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update category
   * PUT /api/v1/events/categories/:categoryId
   * Body: UpdateCategoryDto
   * Access: Protected (admin only)
   */
  @Put('categories/:categoryId')
  @UseGuards(JwtGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    example: 1,
    description: 'Optional tenant scope. Must match authenticated tenant when present.',
  })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 403, description: 'Tenant scope mismatch' })
  async updateCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: any,
    @Query('tenantId') tenantId?: string,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const parsedTenantId = this.resolveTenantScope(req, tenantId);
    const category = await this.eventsService.updateCategory(categoryId, updateCategoryDto, parsedTenantId);

    return {
      statusCode: 200,
      message: 'Category updated successfully',
      data: category,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Delete category
   * DELETE /api/v1/events/categories/:categoryId
   * Access: Protected (admin only)
   */
  @Delete('categories/:categoryId')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete category by ID' })
  @ApiQuery({
    name: 'tenantId',
    required: false,
    example: 1,
    description: 'Optional tenant scope. Must match authenticated tenant when present.',
  })
  @ApiResponse({ status: 204, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 403, description: 'Tenant scope mismatch' })
  async deleteCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Request() req: any,
    @Query('tenantId') tenantId?: string,
  ): Promise<void> {
    const parsedTenantId = this.resolveTenantScope(req, tenantId);
    await this.eventsService.deleteCategory(categoryId, parsedTenantId);
  }

  private resolveTenantScope(req: any, tenantId?: string): number | undefined {
    return resolveScope(req, tenantId);
  }

  private parseOptionalPositiveInt(value?: string): number | undefined {
    return parseOptionalTenantId(value);
  }
}

