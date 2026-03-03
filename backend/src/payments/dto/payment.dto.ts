import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Create Payment DTO
 */
export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  eventId!: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  categoryId!: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  contestantId!: number;

  @ApiProperty({ example: 5, minimum: 1 })
  @IsNumber()
  @Min(1)
  voteQuantity!: number;

  @ApiProperty({ example: 100, minimum: 1 })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ example: 'ETB', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiProperty({
    enum: ['stripe', 'paypal', 'chapa', 'telebirr', 'santimpay', 'crypto', 'manual'],
    example: 'santimpay',
  })
  @IsEnum(['stripe', 'paypal', 'chapa', 'telebirr', 'santimpay', 'crypto', 'manual'])
  provider!:
    | 'stripe'
    | 'paypal'
    | 'chapa'
    | 'telebirr'
    | 'santimpay'
    | 'crypto'
    | 'manual';

  @ApiPropertyOptional({
    enum: ['ethereum', 'bitcoin', 'solana'],
    example: 'ethereum',
    description: 'Required when provider is crypto',
  })
  @IsOptional()
  @IsEnum(['ethereum', 'bitcoin', 'solana'])
  cryptoNetwork?: 'ethereum' | 'bitcoin' | 'solana';
}

/**
 * Process Refund DTO
 */
export class ProcessRefundDto {
  @ApiProperty({ example: 'Duplicate transaction' })
  @IsString()
  reason!: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  amount?: number;
}

/**
 * Payment Webhook DTO
 */
export class PaymentWebhookDto {
  @ApiProperty({ example: 'charge.success' })
  @IsString()
  event!: string;

  @ApiProperty({
    enum: ['stripe', 'paypal', 'chapa', 'telebirr', 'santimpay', 'crypto', 'manual'],
    example: 'chapa',
  })
  @IsEnum(['stripe', 'paypal', 'chapa', 'telebirr', 'santimpay', 'crypto', 'manual'])
  provider!: string;

  @ApiPropertyOptional({ example: 'TXN-12345' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ example: 'success' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: Object, example: { tx_ref: 'vote_1_1700', status: 'success' } })
  @IsOptional()
  data?: any;
}
