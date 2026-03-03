import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentProviderEnvironment {
  TEST = 'test',
  LIVE = 'live',
}

export enum PaymentProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('payment_providers')
@Index(['provider_name'])
@Index(['provider_code'])
@Index(['status'])
export class PaymentProviderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'provider_name', length: 100 })
  provider_name: string;

  @Column({ name: 'provider_code', length: 50 })
  provider_code: string;

  @Column({ name: 'api_key', type: 'varchar', length: 512, nullable: true })
  api_key: string | null;

  @Column({ name: 'secret_key', type: 'varchar', length: 512, nullable: true })
  secret_key: string | null;

  @Column({ name: 'webhook_url', type: 'varchar', length: 512, nullable: true })
  webhook_url: string | null;

  @Column({ name: 'webhook_secret', type: 'varchar', length: 512, nullable: true })
  webhook_secret: string | null;

  @Column({
    name: 'environment',
    type: 'enum',
    enum: PaymentProviderEnvironment,
    default: PaymentProviderEnvironment.TEST,
  })
  environment: PaymentProviderEnvironment;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PaymentProviderStatus,
    default: PaymentProviderStatus.INACTIVE,
  })
  status: PaymentProviderStatus;

  @Column({ name: 'min_amount', type: 'numeric', precision: 10, scale: 2, default: 0.01 })
  min_amount: number;

  @Column({ name: 'max_amount', type: 'numeric', precision: 12, scale: 2, default: 999999.99 })
  max_amount: number;

  @Column({ name: 'fee_percentage', type: 'numeric', precision: 5, scale: 2, default: 0.0 })
  fee_percentage: number;

  @Column({ name: 'fee_fixed', type: 'numeric', precision: 10, scale: 2, default: 0.0 })
  fee_fixed: number;

  @Column({ name: 'supported_currencies', type: 'jsonb', nullable: true })
  supported_currencies: string[] | null;

  @Column({ name: 'supported_countries', type: 'jsonb', nullable: true })
  supported_countries: string[] | null;

  @Column({ name: 'config_data', type: 'jsonb', nullable: true })
  config_data: Record<string, any> | null;

  @Column({ name: 'last_tested', type: 'timestamp', nullable: true })
  last_tested: Date | null;

  @Column({ name: 'test_result', type: 'varchar', length: 255, nullable: true })
  test_result: string | null;

  @Column({ name: 'enabled_for_events', type: 'jsonb', nullable: true })
  enabled_for_events: number[] | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
