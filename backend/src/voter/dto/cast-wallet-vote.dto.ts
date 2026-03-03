import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VoteType } from '@/entities/vote.entity';

export class CastWalletVoteDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  eventId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  contestantId: number;

  @ApiPropertyOptional({ enum: VoteType, example: VoteType.PAID })
  @IsOptional()
  @IsEnum(VoteType)
  voteType?: VoteType;

  @ApiPropertyOptional({ example: 'canvas-fp-abc123' })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;

  @ApiPropertyOptional({ example: '196.188.10.25' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0' })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
