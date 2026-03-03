import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { EventEntity } from './event.entity';
import { SponsorEntity } from './sponsor.entity';

@Entity('event_sponsors')
@Index(['event_id'])
@Index(['sponsor_id'])
export class EventSponsorEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'event_id' })
  event_id: number;

  @Column({ name: 'sponsor_id' })
  sponsor_id: number;

  @ManyToOne(() => EventEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @ManyToOne(() => SponsorEntity, (sponsor) => sponsor.event_links, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sponsor_id' })
  sponsor: SponsorEntity;

  @Column({ name: 'placement', nullable: true, type: 'varchar', length: 100 })
  placement: string | null;

  @Column({ name: 'display_order', default: 0 })
  display_order: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
