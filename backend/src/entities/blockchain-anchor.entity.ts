import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum BlockchainStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

@Entity('blockchain_anchors')
@Index(['batch_id'])
@Index(['event_id'])
@Index(['blockchain_tx_hash'])
@Index(['created_at'])
export class BlockchainAnchorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  batch_id: number;

  @Column({ type: 'integer', nullable: true })
  event_id: number | null;

  @Column({ type: 'varchar', length: 66, nullable: true })
  blockchain_tx_hash: string | null; // Ethereum transaction hash (0x...)

  @Column({ type: 'enum', enum: BlockchainStatus, default: BlockchainStatus.PENDING })
  blockchain_status: BlockchainStatus;

  @Column({ default: 0 })
  confirmations: number;

  @Column({ type: 'timestamp', nullable: true })
  confirmed_at: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contract_address: string | null;

  @Column({ type: 'text', nullable: true })
  merkle_root: string | null;

  @Column({ type: 'text', nullable: true })
  transaction_receipt: string | null; // JSON stringified receipt

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
