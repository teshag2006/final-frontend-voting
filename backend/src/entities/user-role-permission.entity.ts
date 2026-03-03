import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_roles_permissions')
@Index(['user_id'])
@Index(['permission_key'])
export class UserRolePermissionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'permission', length: 255 })
  permission_key: string; // e.g., 'vote:cast', 'admin:users:view'

  // Virtual compatibility fields used by existing services.
  description?: string;
  is_granted?: boolean;
  expires_at?: Date;

  @Column({ name: 'granted_at', nullable: true })
  granted_at: Date;

  @Column({ name: 'granted_by', nullable: true })
  granted_by_user_id: number;

  @Column({ name: 'revoked_by', nullable: true })
  revoked_by_user_id: number;

  @Column({ name: 'revoked_at', nullable: true })
  revoked_at: Date;
}
