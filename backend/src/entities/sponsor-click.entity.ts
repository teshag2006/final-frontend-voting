import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('sponsor_clicks')
@Index(['sponsor_id'])
@Index(['created_at'])
export class SponsorClickEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sponsor_id', type: 'integer', nullable: true })
  sponsor_id: number | null;

  @Column({ name: 'placement_id', type: 'varchar', length: 255, nullable: true })
  placement_id: string | null;

  @Column({ name: 'source_page', type: 'varchar', length: 255, nullable: true })
  source_page: string | null;

  @Column({ name: 'event_slug', type: 'varchar', length: 255, nullable: true })
  event_slug: string | null;

  @Column({ name: 'contestant_slug', type: 'varchar', length: 255, nullable: true })
  contestant_slug: string | null;

  @Column({ name: 'target_url', type: 'varchar', length: 1024, nullable: true })
  target_url: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ip_address: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  user_agent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

