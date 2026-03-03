import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { DeviceFingerprintEntity } from './device-fingerprint.entity';
import { DeviceReputationEntity } from './device-reputation.entity';
import { DeviceAnomalyEntity } from './device-anomaly.entity';

@Entity('devices')
@Index(['user_id'])
@Index(['is_blocked'])
@Index(['created_at'])
export class DeviceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.devices, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: true })
  user_id: number;

  @Column({ name: 'device_fingerprint' })
  device_fingerprint: string;

  @Column({ nullable: true })
  device_name: string;

  @Column({ nullable: true })
  device_type: string;

  @Column({ nullable: true })
  os_name: string;

  @Column({ nullable: true })
  os_version: string;

  @Column({ nullable: true })
  browser_name: string;

  @Column({ nullable: true })
  browser_version: string;

  @Column({ nullable: true })
  ip_address: string;

  // Virtual alias derived from city/country (not a physical DB column).
  get last_known_location(): string {
    if (this.city && this.country) return `${this.city}, ${this.country}`;
    return this.city || this.country || '';
  }

  set last_known_location(value: string) {
    if (!value) return;
    const [city, country] = value.split(',').map((v) => v.trim());
    this.city = city || this.city;
    this.country = country || this.country;
  }

  @Column({ default: false })
  is_blocked: boolean;

  @Column({ nullable: true, type: 'text' })
  block_reason: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  verified_at: Date;

  @Column({ nullable: true })
  first_seen: Date;

  @Column({ nullable: true })
  last_active: Date;

  @Column({ default: false })
  is_mobile: boolean;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ name: 'last_seen', nullable: true })
  last_seen_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => DeviceFingerprintEntity, (fingerprint) => fingerprint.device, {
    onDelete: 'CASCADE',
    eager: false,
  })
  fingerprints: DeviceFingerprintEntity[];

  @OneToMany(() => DeviceReputationEntity, (reputation) => reputation.device, {
    onDelete: 'CASCADE',
    eager: false,
  })
  reputation: DeviceReputationEntity[];

  @OneToMany(() => DeviceAnomalyEntity, (anomaly) => anomaly.device, {
    onDelete: 'CASCADE',
    eager: false,
  })
  anomalies: DeviceAnomalyEntity[];
}
