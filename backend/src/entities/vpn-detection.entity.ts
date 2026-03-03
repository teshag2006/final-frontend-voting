import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('vpn_detections')
@Index(['ip_address'])
@Index(['detected_at'])
export class VpnDetectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'vote_id' })
  vote_id: number;

  @Column({ name: 'device_id' })
  device_id: number;

  @Column({ length: 45, nullable: true })
  ip_address: string;

  @Column({ length: 100, nullable: true })
  vpn_provider: string;

  @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
  detection_confidence: number;

  @Column({ default: false })
  is_vpn_confirmed: boolean;

  // Compatibility fields (not persisted in DB)
  country?: string;
  city?: string;
  isp?: string;
  detection_details?: Record<string, any>;

  get is_vpn(): boolean {
    return this.is_vpn_confirmed;
  }

  set is_vpn(value: boolean) {
    this.is_vpn_confirmed = value;
  }

  get is_proxy(): boolean {
    return false;
  }

  set is_proxy(_value: boolean) {}

  get is_tor(): boolean {
    return false;
  }

  set is_tor(_value: boolean) {}

  @CreateDateColumn()
  detected_at: Date;
}
