import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { VoteEntity } from './vote.entity';

@Entity('merkle_proofs')
@Index(['vote_id'])
@Index(['batch_id'])
@Index(['created_at'])
export class MerkleProofEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vote_id: number;

  @ManyToOne(() => VoteEntity, (vote) => vote.merkle_proofs, {
    onDelete: 'CASCADE',
  })
  vote: VoteEntity;

  @Column()
  batch_id: number;

  @Column({ type: 'jsonb' })
  merkle_path: any; // JSON array of hash steps

  // Compatibility field (not persisted in canonical SQL)
  merkle_root?: string;

  @Column({ type: 'text', nullable: true })
  proof_hash: string;

  @Column({ name: 'is_valid', default: false })
  is_verified: boolean;

  @Column({ name: 'leaf_index', type: 'integer', nullable: true })
  leaf_index: number | null;

  @Column({ nullable: true })
  verified_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
