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
import { RolesService } from './roles.service';

/**
 * Roles Controller
 * Handles role and permission management
 */
@Controller('admin/roles')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Get all roles
   * GET /api/v1/admin/roles
   * Access: Admin
   */
  @Get()
  async getAllRoles() {
    const roles = await this.rolesService.getAllRoles();
    return {
      statusCode: 200,
      message: 'Roles retrieved successfully',
      data: roles,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get role by ID
   * GET /api/v1/admin/roles/:id
   * Access: Admin
   */
  @Get(':id')
  async getRole(@Param('id', ParseIntPipe) id: number) {
    const role = await this.rolesService.getRoleById(id);
    return {
      statusCode: 200,
      message: 'Role retrieved successfully',
      data: role,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create new role
   * POST /api/v1/admin/roles
   * Access: Admin
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRole(
    @Body() createRoleDto: { name: string; description?: string; permissions?: string[] },
  ) {
    const role = await this.rolesService.createRole(createRoleDto);
    return {
      statusCode: 201,
      message: 'Role created successfully',
      data: role,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update role
   * PATCH /api/v1/admin/roles/:id
   * Access: Admin
   */
  @Patch(':id')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: { name?: string; description?: string; permissions?: string[] },
  ) {
    const role = await this.rolesService.updateRole(id, updateRoleDto);
    return {
      statusCode: 200,
      message: 'Role updated successfully',
      data: role,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Delete role
   * DELETE /api/v1/admin/roles/:id
   * Access: Admin
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    await this.rolesService.deleteRole(id);
    return {
      statusCode: 204,
      message: 'Role deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get all permissions
   * GET /api/v1/admin/permissions
   * Access: Admin
   */
  @Get('permissions/all')
  async getAllPermissions() {
    const permissions = await this.rolesService.getAllPermissions();
    return {
      statusCode: 200,
      message: 'Permissions retrieved successfully',
      data: permissions,
      timestamp: new Date().toISOString(),
    };
  }
}
