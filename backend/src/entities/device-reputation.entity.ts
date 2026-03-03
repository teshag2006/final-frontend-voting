import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DeviceEntity } from './device.entity';

@Entity('device_reputation')
@Index(['device_id'])
@Index(['trust_score'])
export class DeviceReputationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'device_id' })
  device_id: number;

  // Compatibility field (not persisted in DB)
  fingerprint?: string;

  @Column({ name: 'votes_cast', default: 0 })
  votes_cast: number;

  @Column({ name: 'fraudulent_votes', default: 0 })
  fraud_count: number;

  @Column({ name: 'last_checked', nullable: true })
  last_checked: Date;

  @Column({ name: 'last_updated', nullable: true })
  last_updated: Date;

  @Column({
    name: 'reputation_score',
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0.5,
  })
  trust_score: number; // 0.0 to 1.0

  // Compatibility aliases (not persisted in DB)
  get reputation_score(): number {
    return Number(this.trust_score);
  }

  set reputation_score(value: number) {
    this.trust_score = value;
  }

  get fraudulent_votes(): number {
    return this.fraud_count;
  }

  set fraudulent_votes(value: number) {
    this.fraud_count = value;
  }

  successful_votes = 0;
  failed_votes = 0;
  verification_failures = 0;
  risk_factors = '';
  last_assessment: Date | null = null;
  created_at: Date | null = null;
  updated_at: Date | null = null;

  // Reverse relation to Device
  @ManyToOne(() => DeviceEntity, (device) => device.reputation, { nullable: true })
  @JoinColumn({ name: 'device_id' })
  device: DeviceEntity;
}
