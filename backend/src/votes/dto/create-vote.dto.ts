import {
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { VoteType } from '@/entities/vote.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVoteDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  eventId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  contestantId: number;

  @ApiProperty({ enum: VoteType, example: VoteType.FREE })
  @IsEnum(VoteType)
  voteType: VoteType;

  @ApiPropertyOptional({ example: 123 })
  @IsOptional()
  @IsNumber()
  paymentId?: number;

  // Device fingerprinting data
  @ApiPropertyOptional({ example: 'canvas-fp-abc123' })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({ example: '196.188.10.25' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
