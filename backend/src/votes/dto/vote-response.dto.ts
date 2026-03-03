import { VoteStatus, VoteType, FraudRiskLevel } from '@/entities/vote.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VoteResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  eventId: number;
  @ApiProperty()
  categoryId: number;
  @ApiProperty()
  contestantId: number;
  @ApiPropertyOptional({ nullable: true })
  voterId: number | null;
  @ApiProperty({ enum: VoteType })
  voteType: VoteType;
  @ApiProperty({ enum: VoteStatus })
  status: VoteStatus;
  @ApiProperty({ enum: FraudRiskLevel })
  fraudRiskLevel: FraudRiskLevel;
  @ApiProperty()
  fraudRiskScore: number;
  @ApiProperty()
  trustScore: number;
  @ApiProperty()
  isAnonymous: boolean;
  @ApiPropertyOptional({
    type: Object,
    example: { code: 'VOTE-123', hash: 'abc123', expiresAt: '2026-12-31T00:00:00.000Z' },
  })
  receipt?: {
    code: string;
    hash: string;
    expiresAt: Date;
  };
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}
