import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { EventEntity } from './event.entity';

@Entity('tenants')
@Index(['slug'], { unique: true })
@Index(['status'])
export class TenantEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 120, unique: true })
  slug: string;

  @Column({ length: 32, default: 'active' })
  status: string;

  @Column({ length: 64, default: 'starter' })
  plan: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => EventEntity, (event) => event.tenant)
  events: EventEntity[];
}
