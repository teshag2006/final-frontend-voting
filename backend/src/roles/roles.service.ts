import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRolePermissionEntity } from '@/entities/user-role-permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(UserRolePermissionEntity)
    private roleRepository: Repository<UserRolePermissionEntity>,
  ) {}

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<UserRolePermissionEntity[]> {
    return this.roleRepository.find();
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: number): Promise<UserRolePermissionEntity> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new BadRequestException('Role not found');
    }
    return role;
  }

  /**
   * Create new role
   */
  async createRole(data: { name: string; description?: string; permissions?: string[] }): Promise<UserRolePermissionEntity> {
    const role = this.roleRepository.create({
      permission_key: data.name,
      description: data.description,
    });
    return this.roleRepository.save(role);
  }

  /**
   * Update role
   */
  async updateRole(id: number, data: { name?: string; description?: string; permissions?: string[] }): Promise<UserRolePermissionEntity> {
    const role = await this.getRoleById(id);
    if (data.name) role.permission_key = data.name;
    if (data.description) role.description = data.description;
    return this.roleRepository.save(role);
  }

  /**
   * Delete role
   */
  async deleteRole(id: number): Promise<void> {
    const role = await this.getRoleById(id);
    await this.roleRepository.remove(role);
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<string[]> {
    // Return default permissions
    return [
      'view_dashboard',
      'manage_events',
      'manage_categories',
      'manage_contestants',
      'manage_votes',
      'view_fraud',
      'manage_payments',
      'view_blockchain',
      'manage_users',
      'manage_roles',
      'view_reports',
      'export_data',
    ];
  }
}
