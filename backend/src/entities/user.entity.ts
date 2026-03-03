import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { VoteEntity } from './vote.entity';
import { ContestantEntity } from './contestant.entity';
import { DeviceEntity } from './device.entity';
import { NotificationEntity } from './notification.entity';
import { AuditLogEntity } from './audit-log.entity';
import { UserRolePermissionEntity } from './user-role-permission.entity';
import { PaymentEntity } from './payment.entity';

export enum UserRole {
  ADMIN = 'admin',
  CONTESTANT = 'contestant',
  VOTER = 'voter',
  TRANSPARENCY = 'transparency',
  MEDIA = 'media',
  OBSERVER = 'observer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

@Entity('users')
@Index(['email'])
@Index(['role'])
@Index(['status'])
@Index(['tenant_id'])
@Index(['created_at'])
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ name: 'tenant_id', type: 'integer', nullable: true })
  tenant_id: number | null;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ name: 'phone_number', nullable: true })
  phone_number: string;

  // Alias for phone (used in some services)
  get phone(): string {
    return this.phone_number;
  }

  set phone(value: string) {
    this.phone_number = value;
  }

  get is_active(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  set is_active(value: boolean) {
    this.status = value ? UserStatus.ACTIVE : UserStatus.INACTIVE;
  }

  @Column({ name: 'google_id', nullable: true })
  google_id: string | null;

  @Column({ name: 'profile_image_url', nullable: true })
  profile_image_url: string | null;

  // Virtual profile fields (not present in canonical SQL users table).
  bio?: string;
  date_of_birth?: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VOTER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ name: 'email_verified', default: false })
  email_verified: boolean;

  @Column({ name: 'email_verified_at', nullable: true })
  email_verified_at: Date;

  @Column({ name: 'phone_verified', default: false })
  phone_verified: boolean;

  @Column({ name: 'phone_verified_at', nullable: true })
  phone_verified_at: Date;

  @Column({ name: 'daily_vote_limit', nullable: true })
  daily_vote_limit: number;

  @Column({ name: 'daily_spending_limit', type: 'decimal', precision: 10, scale: 2, nullable: true })
  daily_spending_limit: number;

  // Virtual 2FA fields (not present in canonical SQL users table).
  two_factor_enabled?: boolean;
  two_factor_method?: string;

  @Column({ name: 'last_login', nullable: true })
  last_login: Date;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failed_login_attempts: number;

  @Column({ name: 'account_locked_until', type: 'timestamp', nullable: true })
  account_locked_until: Date | null;

  @Column({ name: 'refresh_token_hash', type: 'text', nullable: true })
  refresh_token_hash: string | null;

  @Column({ name: 'refresh_token_expires_at', type: 'timestamp', nullable: true })
  refresh_token_expires_at: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'deleted_at', nullable: true })
  deleted_at: Date;

  // Relations
  @OneToMany(() => VoteEntity, (vote) => vote.voter, {
    onDelete: 'CASCADE',
    eager: false,
  })
  votes: VoteEntity[];

  @OneToMany(() => ContestantEntity, (contestant) => contestant.user, {
    onDelete: 'CASCADE',
    eager: false,
  })
  contestants: ContestantEntity[];

  @OneToMany(() => DeviceEntity, (device) => device.user, {
    onDelete: 'CASCADE',
    eager: false,
  })
  devices: DeviceEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user, {
    onDelete: 'CASCADE',
    eager: false,
  })
  notifications: NotificationEntity[];

  @OneToMany(() => AuditLogEntity, (auditLog) => auditLog.user, {
    onDelete: 'CASCADE',
    eager: false,
  })
  auditLogs: AuditLogEntity[];

  @OneToMany(() => UserRolePermissionEntity, (permission) => permission.user, {
    onDelete: 'CASCADE',
    eager: false,
  })
  permissions: UserRolePermissionEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.voter, {
    onDelete: 'CASCADE',
    eager: false,
  })
  payments: PaymentEntity[];
}
