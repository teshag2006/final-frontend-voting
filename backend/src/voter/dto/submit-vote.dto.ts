import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitVoteDto {
  @ApiProperty({ example: '2' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ example: '10' })
  @IsOptional()
  @IsString()
  contestantId?: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isPaid: boolean;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}
