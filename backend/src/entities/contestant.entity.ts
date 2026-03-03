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
import { EventEntity } from './event.entity';
import { CategoryEntity } from './category.entity';
import { UserEntity } from './user.entity';
import { VoteEntity } from './vote.entity';
import { PaymentEntity } from './payment.entity';
import { MediaFileEntity } from './media-file.entity';

export enum ContestantStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DISQUALIFIED = 'disqualified',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('contestants')
@Index(['event_id'])
@Index(['category_id'])
@Index(['status'])
@Index(['created_at'])
export class ContestantEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EventEntity, (event) => event.contestants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column()
  event_id: number;

  @ManyToOne(() => CategoryEntity, (category) => category.contestants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: CategoryEntity;

  @Column()
  category_id: number;

  @ManyToOne(() => UserEntity, (user) => user.contestants, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true, unique: false })
  slug: string;

  @Column({ nullable: true, length: 255 })
  tagline: string;

  @Column({ nullable: true, length: 100 })
  country: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  // Alias for phone (used in some services)
  get phone(): string {
    return this.phone_number;
  }

  set phone(value: string) {
    this.phone_number = value;
  }

  // Virtual alias mapped to individual social columns in SQL schema.
  get social_media_handles(): {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  } {
    return {
      twitter: this.twitter_handle,
      instagram: this.instagram_handle,
      facebook: this.facebook_url,
      tiktok: this.tiktok_handle,
      youtube: this.youtube_channel,
      linkedin: this.linkedin_profile,
    };
  }

  set social_media_handles(value: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  }) {
    if (!value) return;
    this.twitter_handle = value.twitter ?? this.twitter_handle;
    this.instagram_handle = value.instagram ?? this.instagram_handle;
    this.facebook_url = value.facebook ?? this.facebook_url;
    this.tiktok_handle = value.tiktok ?? this.tiktok_handle;
    this.youtube_channel = value.youtube ?? this.youtube_channel;
    this.linkedin_profile = value.linkedin ?? this.linkedin_profile;
  }

  @Column({ nullable: true, type: 'date' })
  date_of_birth: Date;

  @Column({ nullable: true, type: 'text' })
  biography: string;

  @Column({ nullable: true })
  profile_image_url: string;

  @Column({ nullable: true })
  banner_image_url: string;

  @Column({ type: 'enum', enum: ContestantStatus, default: ContestantStatus.DRAFT })
  status: ContestantStatus;

  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.UNVERIFIED })
  verification_status: VerificationStatus;

  @Column({ nullable: true })
  verified_at: Date;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'verified_by' })
  verified_by: UserEntity;

  @Column({ name: 'verified_by', nullable: true })
  verified_by_id: number;

  @Column({ default: 0 })
  vote_count: number;

  @Column({ default: 0 })
  paid_vote_count: number;

  @Column({ default: 0 })
  free_vote_count: number;

  @Column({ type: 'numeric', default: '0.00' })
  total_revenue: number;

  @Column({ nullable: true })
  display_order: number;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ nullable: true })
  twitter_handle: string;

  @Column({ nullable: true })
  instagram_handle: string;

  @Column({ nullable: true })
  facebook_url: string;

  @Column({ nullable: true })
  tiktok_handle: string;

  @Column({ nullable: true })
  youtube_channel: string;

  @Column({ nullable: true })
  website_url: string;

  @Column({ nullable: true })
  linkedin_profile: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => VoteEntity, (vote) => vote.contestant, {
    onDelete: 'CASCADE',
    eager: false,
  })
  votes: VoteEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.contestant, {
    onDelete: 'CASCADE',
    eager: false,
  })
  payments: PaymentEntity[];

  @OneToMany(() => MediaFileEntity, (media) => media.contestant, {
    onDelete: 'CASCADE',
    eager: false,
  })
  media: MediaFileEntity[];
}
