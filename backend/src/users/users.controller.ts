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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRole } from '@/entities/user.entity';

/**
 * Helper to convert camelCase keys to snake_case in an object
 */
function camelToSnakeCase(obj: Record<string, any>): Record<string, any> {
  if (!obj || typeof obj !== 'object') return obj;
  const result: Record<string, any> = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

/**
 * Admin Users Controller
 */
@Controller('admin/users')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users
   * GET /api/v1/admin/users
   * Access: Admin
   */
  @Get()
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('role') role?: string,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    // Convert string role to UserRole enum if provided
    const roleFilter = role ? (role as UserRole) : undefined;
    const result = await this.usersService.getAllUsers(page, limit, roleFilter, undefined, tenantId);
    return {
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: result.data,
      total: result.total,
      page: result.page,
      pages: result.pages,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get user by ID
   * GET /api/v1/admin/users/:id
   * Access: Admin
   */
  @Get(':id')
  async getUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const user = await this.usersService.getUserById(id, tenantId);
    return {
      statusCode: 200,
      message: 'User retrieved successfully',
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create new user
   * POST /api/v1/admin/users
   * Access: Admin
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() body: any,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    // Convert camelCase to snake_case for DTO
    const createUserDto: CreateUserDto = camelToSnakeCase(body) as CreateUserDto;
    const user = await this.usersService.createUser(createUserDto, tenantId);
    return {
      statusCode: 201,
      message: 'User created successfully',
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update user
   * PATCH /api/v1/admin/users/:id
   * Access: Admin
   */
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    // Convert camelCase to snake_case for DTO
    const updateUserDto: UpdateUserDto = camelToSnakeCase(body) as UpdateUserDto;
    const user = await this.usersService.updateUser(id, updateUserDto, tenantId);
    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update user role
   * PATCH /api/v1/admin/users/:id/role
   * Access: Admin
   */
  @Patch(':id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: UserRole },
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const user = await this.usersService.updateUserRole(id, body.role, tenantId);
    return {
      statusCode: 200,
      message: 'User role updated successfully',
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Delete user
   * DELETE /api/v1/admin/users/:id
   * Access: Admin
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    await this.usersService.deleteUser(id, tenantId);
    return {
      statusCode: 204,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Contestant Users Controller
 */
@Controller('contestant')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.CONTESTANT, UserRole.ADMIN)
export class UsersContestantController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get my profile
   * GET /api/v1/contestant/profile
   * Access: Contestant
   */
  @Get('profile')
  async getMyProfile(@Request() req: any) {
    const user = await this.usersService.getUserById(req.user.id);
    return {
      statusCode: 200,
      message: 'Profile retrieved successfully',
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update my profile
   * PATCH /api/v1/contestant/profile
   * Access: Contestant
   */
  @Patch('profile')
  async updateMyProfile(
    @Request() req: any,
    @Body() body: any,
  ) {
    // Convert camelCase to snake_case for DTO
    const updateUserDto: UpdateUserDto = camelToSnakeCase(body) as UpdateUserDto;
    const user = await this.usersService.updateUser(req.user.id, updateUserDto);
    return {
      statusCode: 200,
      message: 'Profile updated successfully',
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update password
   * PATCH /api/v1/contestant/password
   * Access: Contestant
   */
  @Patch('password')
  async updatePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    await this.usersService.updatePassword(req.user.id, body.newPassword);
    return {
      statusCode: 200,
      message: 'Password updated successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
