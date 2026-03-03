import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { VoteWalletEntity } from './vote-wallet.entity';
import { PaymentEntity } from './payment.entity';

@Entity('wallet_vote_credits')
@Index(['wallet_id'])
@Index(['payment_id'], { unique: true })
@Index(['votes_remaining'])
export class WalletVoteCreditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  wallet_id: number;

  @ManyToOne(() => VoteWalletEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: VoteWalletEntity;

  @Column({ type: 'integer' })
  payment_id: number;

  @ManyToOne(() => PaymentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;

  @Column({ type: 'integer', default: 0 })
  votes_credited: number;

  @Column({ type: 'integer', default: 0 })
  votes_remaining: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  amount: number | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

