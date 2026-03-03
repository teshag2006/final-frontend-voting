import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

export enum IPThreatLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('suspicious_ip_reputation')
@Index(['ip_address'])
@Index(['threat_level'])
@Index(['last_updated'])
export class SuspiciousIPReputationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 45, unique: true })
  ip_address: string;

  @Column({ name: 'reputation_score', type: 'numeric', precision: 5, scale: 2, nullable: true })
  reputation_score: number;

  @Column({ type: 'enum', enum: IPThreatLevel, default: IPThreatLevel.LOW })
  threat_level: IPThreatLevel;

  @Column({ name: 'is_blacklisted', default: false })
  is_blacklisted: boolean;

  @Column({ name: 'fraud_reports', default: 0 })
  fraud_count: number;

  @Column({ name: 'last_updated', nullable: true })
  last_updated: Date;

  // Compatibility fields (not persisted in DB)
  failed_login_count?: number;
  blacklist_reason?: string;
  country?: string;
  city?: string;
  risk_factors?: string;

  // Compatibility field (not persisted in DB)
  created_at?: Date;

  // Compatibility field (not persisted in DB)
  updated_at?: Date;
}
