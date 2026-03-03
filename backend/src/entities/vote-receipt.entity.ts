import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { VoteEntity } from './vote.entity';

@Entity('vote_receipts')
@Index(['vote_id'])
@Index(['event_id'])
export class VoteReceiptEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => VoteEntity, (vote) => vote.receipts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vote_id' })
  vote: VoteEntity;

  @Column({ name: 'vote_id' })
  vote_id: number;

  @Column({ name: 'event_id', type: 'integer', nullable: true })
  event_id: number | null;

  @Column({ name: 'receipt_number', unique: true })
  receipt_code: string;

  @Column({ name: 'voter_email', type: 'varchar', length: 255, nullable: true })
  voter_email: string | null;

  @Column({ name: 'voter_phone', type: 'varchar', length: 20, nullable: true })
  voter_phone: string | null;

  @Column({ name: 'event_name', type: 'varchar', length: 255, nullable: true })
  event_name: string | null;

  @Column({ name: 'category_name', type: 'varchar', length: 255, nullable: true })
  category_name: string | null;

  @Column({ name: 'contestant_name', type: 'varchar', length: 255, nullable: true })
  contestant_name: string | null;

  @Column({ name: 'amount', type: 'numeric', precision: 10, scale: 2, nullable: true })
  amount: number | null;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  payment_method: string | null;

  @Column({ name: 'receipt_hash', nullable: true })
  receipt_hash: string;

  @Column({ name: 'is_verified', default: false })
  is_verified: boolean;

  @Column({ name: 'verification_timestamp', type: 'timestamp', nullable: true })
  verification_timestamp: Date | null;

  // Compatibility fields (not persisted in DB)
  verification_code?: string;
  expires_at?: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  // Compatibility field (not persisted in DB)
  updated_at?: Date;
}
