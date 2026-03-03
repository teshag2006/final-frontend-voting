import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole, UserStatus } from '@/entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  /**
   * Create a new user
   */
  async createUser(createUserDto: CreateUserDto, tenantId?: number): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.hashSecret(createUserDto.password);

    // Create user
    const username = await this.generateUniqueUsername(createUserDto.email);
    const user = this.usersRepository.create({
      email: createUserDto.email,
      username,
      password_hash: passwordHash,
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      phone: createUserDto.phone,
      role: createUserDto.role || UserRole.VOTER,
      status: UserStatus.ACTIVE,
      email_verified: false,
      phone_verified: false,
      tenant_id: tenantId,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.toResponseDto(savedUser);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number, tenantId?: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['devices', 'notifications', 'permissions', 'votes', 'payments', 'contestants'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (tenantId !== undefined && user.tenant_id !== tenantId) {
      throw new NotFoundException('User not found');
    }

    return this.toResponseDto(user);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(
    page: number = 1,
    limit: number = 50,
    role?: UserRole,
    status?: UserStatus,
    tenantId?: number,
  ): Promise<{ data: UserResponseDto[]; total: number; page: number; pages: number }> {
    const query = this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.devices', 'devices')
      .leftJoinAndSelect('u.notifications', 'notifications')
      .leftJoinAndSelect('u.permissions', 'permissions');

    if (role) {
      query.where('u.role = :role', { role });
    }

    if (status) {
      query.andWhere('u.status = :status', { status });
    }

    if (tenantId !== undefined) {
      query.andWhere('u.tenant_id = :tenantId', { tenantId });
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit).orderBy('u.created_at', 'DESC');

    const [users, total] = await query.getManyAndCount();
    const pages = Math.ceil(total / limit);

    return {
      data: users.map((u) => this.toResponseDto(u)),
      total,
      page,
      pages,
    };
  }

  /**
   * Update user
   */
  async updateUser(id: number, updateUserDto: UpdateUserDto, tenantId?: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['devices', 'notifications', 'permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (tenantId !== undefined && user.tenant_id !== tenantId) {
      throw new NotFoundException('User not found');
    }

    // Update fields
    if (updateUserDto.first_name) user.first_name = updateUserDto.first_name;
    if (updateUserDto.last_name) user.last_name = updateUserDto.last_name;
    if (updateUserDto.phone) user.phone = updateUserDto.phone;
    if (updateUserDto.bio) user.bio = updateUserDto.bio;
    if (updateUserDto.profile_image_url) user.profile_image_url = updateUserDto.profile_image_url;

    user.updated_at = new Date();

    const updatedUser = await this.usersRepository.save(user);
    return this.toResponseDto(updatedUser);
  }

  /**
   * Delete user (soft delete - set status to deleted)
   */
  async deleteUser(id: number, tenantId?: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (tenantId !== undefined && user.tenant_id !== tenantId) {
      throw new NotFoundException('User not found');
    }

    user.status = UserStatus.DELETED;
    user.updated_at = new Date();
    await this.usersRepository.save(user);
  }

  /**
   * Verify user email
   */
  async verifyUserEmail(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.email_verified = true;
    user.updated_at = new Date();
    const updatedUser = await this.usersRepository.save(user);
    return this.toResponseDto(updatedUser);
  }

  /**
   * Change user status
   */
  async changeUserStatus(id: number, status: UserStatus): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['devices', 'notifications', 'permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = status;
    user.updated_at = new Date();
    const updatedUser = await this.usersRepository.save(user);
    return this.toResponseDto(updatedUser);
  }

  /**
   * Update user role
   */
  async updateUserRole(id: number, role: string, tenantId?: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['devices', 'notifications', 'permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (tenantId !== undefined && user.tenant_id !== tenantId) {
      throw new NotFoundException('User not found');
    }

    user.role = role as UserRole;
    user.updated_at = new Date();
    const updatedUser = await this.usersRepository.save(user);
    return this.toResponseDto(updatedUser);
  }

  /**
   * Update user password
   */
  async updatePassword(id: number, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password_hash = await this.hashSecret(newPassword);
    user.updated_at = new Date();
    await this.usersRepository.save(user);
  }

  /**
   * Count users by status
   */
  async countUsersByStatus(status: UserStatus): Promise<number> {
    return this.usersRepository.count({
      where: { status },
    });
  }

  /**
   * Helper: Convert entity to response DTO
   */
  private toResponseDto(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  private async generateUniqueUsername(email: string): Promise<string> {
    const base = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 24) || 'user';
    let candidate = base;
    let suffix = 0;

    while (await this.usersRepository.findOne({ where: { username: candidate } })) {
      suffix += 1;
      candidate = `${base}_${suffix}`.slice(0, 32);
    }

    return candidate;
  }

  private async hashSecret(secret: string): Promise<string> {
    return argon2.hash(secret, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  }
}
