import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  PaymentProviderEnvironment,
  PaymentProviderStatus,
} from '@/entities/payment-provider.entity';

export class CreatePaymentProviderDto {
  @ApiProperty({ example: 'SantimPay' })
  @IsString()
  @MaxLength(100)
  provider_name: string;

  @ApiProperty({ example: 'santimpay' })
  @IsString()
  @MaxLength(50)
  provider_code: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  api_key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secret_key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  webhook_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  webhook_secret?: string;

  @ApiPropertyOptional({ enum: PaymentProviderEnvironment, example: PaymentProviderEnvironment.TEST })
  @IsOptional()
  @IsEnum(PaymentProviderEnvironment)
  environment?: PaymentProviderEnvironment;

  @ApiPropertyOptional({ enum: PaymentProviderStatus, example: PaymentProviderStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PaymentProviderStatus)
  status?: PaymentProviderStatus;

  @ApiPropertyOptional({ example: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_amount?: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_amount?: number;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fee_percentage?: number;

  @ApiPropertyOptional({ example: 3.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fee_fixed?: number;

  @ApiPropertyOptional({ example: ['ETB', 'USD'] })
  @IsOptional()
  @IsArray()
  supported_currencies?: string[];

  @ApiPropertyOptional({ example: ['ET', 'US'] })
  @IsOptional()
  @IsArray()
  supported_countries?: string[];

  @ApiPropertyOptional({ example: { timeoutMs: 15000 } })
  @IsOptional()
  @IsObject()
  config_data?: Record<string, any>;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  enabled_for_events?: number[];
}

export class UpdatePaymentProviderDto {
  @ApiPropertyOptional({ example: 'SantimPay' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  provider_name?: string;

  @ApiPropertyOptional({ example: 'santimpay' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  provider_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  api_key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secret_key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  webhook_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  webhook_secret?: string;

  @ApiPropertyOptional({ enum: PaymentProviderEnvironment })
  @IsOptional()
  @IsEnum(PaymentProviderEnvironment)
  environment?: PaymentProviderEnvironment;

  @ApiPropertyOptional({ enum: PaymentProviderStatus })
  @IsOptional()
  @IsEnum(PaymentProviderStatus)
  status?: PaymentProviderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  max_amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  fee_percentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  fee_fixed?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  supported_currencies?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  supported_countries?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config_data?: Record<string, any>;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  enabled_for_events?: number[];
}
