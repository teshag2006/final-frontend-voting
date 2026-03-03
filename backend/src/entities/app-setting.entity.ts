import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('app_settings')
@Index(['setting_key'])
export class AppSettingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'key', length: 100, unique: true })
  setting_key: string;

  @Column({ name: 'value', type: 'text', nullable: true })
  setting_value: string;

  @Column({
    name: 'category',
    type: 'enum',
    enum: ['general', 'security', 'payment', 'voting', 'system'],
    default: 'general',
  })
  category: string;

  // Compatibility alias used in services/seeders
  get setting_type(): string {
    return this.category;
  }

  set setting_type(value: string) {
    this.category = value || this.category;
  }

  @Column({ type: 'text', nullable: true })
  description: string;

  // Legacy compatibility property (not persisted in canonical SQL)
  is_public = false;

  @Column({ name: 'is_editable', default: true })
  is_editable: boolean;

  @Column({ name: 'updated_by', type: 'integer', nullable: true })
  updated_by: number | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
