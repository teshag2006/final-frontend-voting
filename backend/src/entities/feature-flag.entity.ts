import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('feature_flags')
@Index(['feature_name'])
@Index(['is_enabled'])
export class FeatureFlagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  feature_name: string;

  // Legacy compatibility field (not persisted in canonical SQL)
  description?: string;

  @Column({ default: false })
  is_enabled: boolean;

  // Legacy compatibility field (not persisted in canonical SQL)
  config?: Record<string, any>;

  @Column({ type: 'integer', default: 0 })
  rollout_percentage: number;

  @Column({
    type: 'enum',
    enum: ['development', 'staging', 'production'],
    default: 'production',
  })
  environment: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
