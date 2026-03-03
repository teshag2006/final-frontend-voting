import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { WebhookStatus } from '@/entities/webhook-event.entity';

export class CreateWebhookEventDto {
  @ApiProperty({ example: 'payment.completed' })
  @IsString()
  @MaxLength(100)
  event_type: string;

  @ApiProperty({ example: 'santimpay' })
  @IsString()
  @MaxLength(50)
  provider: string;

  @ApiPropertyOptional({ example: 'ext_12345' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  external_event_id?: string;

  @ApiProperty({ example: { amount: 100, currency: 'ETB' } })
  @IsObject()
  payload: Record<string, any>;

  @ApiPropertyOptional({ enum: WebhookStatus, example: WebhookStatus.RECEIVED })
  @IsOptional()
  @IsEnum(WebhookStatus)
  status?: WebhookStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  error_message?: string;
}

export class UpdateWebhookEventDto {
  @ApiPropertyOptional({ enum: WebhookStatus, example: WebhookStatus.PROCESSED })
  @IsOptional()
  @IsEnum(WebhookStatus)
  status?: WebhookStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  error_message?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  retry_count?: number;
}

export class CreateWebhookAttemptDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  webhook_event_id: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  attempt_number?: number;

  @ApiPropertyOptional({ example: 'https://client.example/webhook' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  endpoint_url?: string;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsInt()
  http_status_code?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsInt()
  @Min(0)
  response_time_ms?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  success?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  error_message?: string;
}
