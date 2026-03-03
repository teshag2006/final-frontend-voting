import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { EventSponsorEntity } from './event-sponsor.entity';

export enum SponsorTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export enum SponsorVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum SponsorAccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  UNDER_REVIEW = 'under_review',
}

@Entity('sponsors')
@Index(['name'])
@Index(['tier'])
@Index(['is_active'])
export class SponsorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'logo_url', nullable: true, type: 'varchar', length: 512 })
  logo_url: string | null;

  @Column({ name: 'website_url', nullable: true, type: 'varchar', length: 512 })
  website_url: string | null;

  @Column({ name: 'contact_person_name', nullable: true, type: 'varchar', length: 255 })
  contact_person_name: string | null;

  @Column({ name: 'phone_number', nullable: true, type: 'varchar', length: 50 })
  phone_number: string | null;

  @Column({ name: 'company_description', nullable: true, type: 'text' })
  company_description: string | null;

  @Column({ name: 'industry_category', nullable: true, type: 'varchar', length: 100 })
  industry_category: string | null;

  @Column({ name: 'company_size', nullable: true, type: 'varchar', length: 100 })
  company_size: string | null;

  @Column({ name: 'country', nullable: true, type: 'varchar', length: 100 })
  country: string | null;

  @Column({ name: 'city', nullable: true, type: 'varchar', length: 100 })
  city: string | null;

  @Column({ name: 'address_line_1', nullable: true, type: 'varchar', length: 255 })
  address_line_1: string | null;

  @Column({ name: 'address_line_2', nullable: true, type: 'varchar', length: 255 })
  address_line_2: string | null;

  @Column({ name: 'postal_code', nullable: true, type: 'varchar', length: 30 })
  postal_code: string | null;

  @Column({ name: 'tax_id_number', nullable: true, type: 'varchar', length: 100 })
  tax_id_number: string | null;

  @Column({ name: 'registration_number', nullable: true, type: 'varchar', length: 100 })
  registration_number: string | null;

  @Column({ name: 'profile_completion_score', type: 'numeric', precision: 5, scale: 2, default: '0' })
  profile_completion_score: number;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: SponsorVerificationStatus,
    default: SponsorVerificationStatus.PENDING,
  })
  verification_status: SponsorVerificationStatus;

  @Column({ name: 'trust_score', type: 'numeric', precision: 5, scale: 2, default: '0' })
  trust_score: number;

  @Column({
    name: 'account_status',
    type: 'enum',
    enum: SponsorAccountStatus,
    default: SponsorAccountStatus.ACTIVE,
  })
  account_status: SponsorAccountStatus;

  @Column({
    name: 'tier',
    type: 'enum',
    enum: SponsorTier,
    default: SponsorTier.BRONZE,
  })
  tier: SponsorTier;

  @Column({ name: 'contact_email', nullable: true, type: 'varchar', length: 255 })
  contact_email: string | null;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @Column({ name: 'scheduled_date', type: 'timestamp', nullable: true })
  scheduled_date: Date | null;

  @Column({ name: 'started_date', type: 'timestamp', nullable: true })
  started_date: Date | null;

  @Column({ name: 'terminated_date', type: 'timestamp', nullable: true })
  terminated_date: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => EventSponsorEntity, (eventSponsor) => eventSponsor.sponsor, {
    eager: false,
  })
  event_links: EventSponsorEntity[];
}
