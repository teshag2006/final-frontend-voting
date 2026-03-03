import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum EnforcementEntityType {
  CONTESTANT = 'contestant',
  SPONSOR = 'sponsor',
}

@Entity('enforcement_logs')
@Index(['entity_type', 'entity_id'])
@Index(['created_at'])
export class EnforcementLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'entity_type', type: 'enum', enum: EnforcementEntityType })
  entity_type: EnforcementEntityType;

  @Column({ name: 'entity_id' })
  entity_id: number;

  @Column({ name: 'violation_type', type: 'varchar', length: 100 })
  violation_type: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'penalty_score', type: 'numeric', precision: 6, scale: 2, default: '0' })
  penalty_score: number;

  @Column({ name: 'action_taken', type: 'varchar', length: 255, nullable: true })
  action_taken: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
