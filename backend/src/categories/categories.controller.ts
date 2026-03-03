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
import { UserRole } from '@/entities/user.entity';
import { OptionalJwtGuard } from '@/auth/guards/optional-jwt.guard';
import { extractAuthenticatedTenantId } from '@/common/helpers/tenant.helper';
import { CategoriesService } from './categories.service';

/**
 * Public Categories Controller
 * No authentication required
 */
@Controller('public/categories')
@UseGuards(OptionalJwtGuard)
export class CategoriesPublicController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Get all categories for an event
   * GET /api/v1/public/categories/:eventId
   * Access: Public
   */
  @Get(':eventId')
  async getCategoriesByEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const result = await this.categoriesService.getCategoriesByEvent(eventId, page, limit, tenantId);
    return {
      statusCode: 200,
      message: 'Categories retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get category details
   * GET /api/v1/public/categories/:eventId/:categoryId
   * Access: Public
   */
  @Get(':eventId/:categoryId')
  async getCategoryDetails(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const category = await this.categoriesService.getCategoryById(categoryId, tenantId);
    return {
      statusCode: 200,
      message: 'Category details retrieved successfully',
      data: category,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Admin Categories Controller
 * Requires admin role
 */
@Controller('admin/categories')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CategoriesAdminController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Get all categories
   * GET /api/v1/admin/categories
   * Access: Admin
   */
  @Get()
  async getAllCategories(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('eventId') eventId?: number,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const result = await this.categoriesService.getAllCategories(page, limit, eventId, tenantId);
    return {
      statusCode: 200,
      message: 'Categories retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get category by ID
   * GET /api/v1/admin/categories/:id
   * Access: Admin
   */
  @Get(':id')
  async getCategory(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const category = await this.categoriesService.getCategoryById(id, tenantId);
    return {
      statusCode: 200,
      message: 'Category retrieved successfully',
      data: category,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create new category
   * POST /api/v1/admin/categories
   * Access: Admin
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCategory(
    @Body() createCategoryDto: {
      eventId: number;
      name: string;
      description?: string;
      votingStart?: Date;
      votingEnd?: Date;
    },
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const category = await this.categoriesService.createCategory(createCategoryDto, tenantId);
    return {
      statusCode: 201,
      message: 'Category created successfully',
      data: category,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update category
   * PATCH /api/v1/admin/categories/:id
   * Access: Admin
   */
  @Patch(':id')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: {
      name?: string;
      description?: string;
      votingStart?: Date;
      votingEnd?: Date;
    },
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const category = await this.categoriesService.updateCategory(id, updateCategoryDto, tenantId);
    return {
      statusCode: 200,
      message: 'Category updated successfully',
      data: category,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Delete category
   * DELETE /api/v1/admin/categories/:id
   * Access: Admin
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    await this.categoriesService.deleteCategory(id, tenantId);
    return {
      statusCode: 204,
      message: 'Category deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
