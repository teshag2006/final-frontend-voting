import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('vote_transactions')
@Index(['user_id'])
@Index(['wallet_id'])
@Index(['contestant_id'])
@Index(['created_at'])
export class VoteTransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  user_id: number;

  @Column({ type: 'integer' })
  wallet_id: number;

  @Column({ type: 'integer' })
  contestant_id: number;

  @Column({ type: 'varchar', length: 10 })
  vote_type: string;

  @Column({ type: 'text', nullable: true })
  payment_reference: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  amount_paid: number | null;

  @Column({ type: 'varchar', nullable: true, length: 45 })
  ip_address: string | null;

  @Column({ type: 'text', nullable: true })
  device_fingerprint: string | null;

  @Column({ type: 'integer', nullable: true })
  risk_score: number | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
