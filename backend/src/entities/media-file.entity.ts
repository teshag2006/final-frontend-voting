import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ContestantEntity } from './contestant.entity';

export enum MediaType {
  PHOTO = 'photo',
  VIDEO = 'video',
}

@Entity('contestant_media_gallery')
@Index(['contestant_id'])
@Index(['media_type'])
@Index(['created_at'])
export class MediaFileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Compatibility field (not persisted in DB)
  user_id?: number;

  // Compatibility relation (not joined from DB table)
  user?: UserEntity;

  @Column({ name: 'contestant_id' })
  contestant_id: number;

  @ManyToOne(() => ContestantEntity, (contestant) => contestant.media, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contestant_id' })
  contestant: ContestantEntity;

  @Column({ type: 'enum', enum: MediaType })
  media_type: MediaType;

  @Column({ name: 'media_url', length: 512 })
  media_url: string;

  @Column({ name: 'display_order', default: 0 })
  display_order: number;

  // Compatibility fields (not persisted in DB)
  filename?: string;
  mime_type?: string;
  file_size?: number;
  thumbnail_url?: string;
  description?: string;
  is_active?: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  // Backward compatibility alias
  get file_url(): string {
    return this.media_url;
  }

  set file_url(value: string) {
    this.media_url = value;
  }
}
