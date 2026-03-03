import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('auth_otp_requests')
@Index(['email'])
@Index(['expires_at'])
@Index(['consumed_at'])
export class AuthOtpRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  email: string;

  @Column({ type: 'text' })
  code_hash: string;

  @Column({ length: 50, default: 'login' })
  purpose: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  consumed_at: Date | null;

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}

