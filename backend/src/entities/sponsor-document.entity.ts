import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { SponsorEntity } from './sponsor.entity';

export enum SponsorDocumentType {
  BUSINESS_LICENSE = 'business_license',
  TAX_CERTIFICATE = 'tax_certificate',
  OTHER = 'other',
}

export enum SponsorDocumentVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('sponsor_documents')
@Index(['sponsor_id'])
@Index(['verification_status'])
export class SponsorDocumentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sponsor_id' })
  sponsor_id: number;

  @ManyToOne(() => SponsorEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sponsor_id' })
  sponsor: SponsorEntity;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: SponsorDocumentType,
    default: SponsorDocumentType.OTHER,
  })
  document_type: SponsorDocumentType;

  @Column({ name: 'file_url', type: 'varchar', length: 512 })
  file_url: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mime_type: string | null;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: SponsorDocumentVerificationStatus,
    default: SponsorDocumentVerificationStatus.PENDING,
  })
  verification_status: SponsorDocumentVerificationStatus;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploaded_at: Date;
}
