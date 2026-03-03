import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, Min } from 'class-validator';

export enum AdminImpersonateTargetType {
  CONTESTANT = 'contestant',
  SPONSOR = 'sponsor',
}

export class AdminImpersonateDto {
  @ApiProperty({ enum: AdminImpersonateTargetType, example: AdminImpersonateTargetType.CONTESTANT })
  @IsEnum(AdminImpersonateTargetType)
  target_type: AdminImpersonateTargetType;

  @ApiProperty({ example: 42 })
  @IsInt()
  @Min(1)
  target_id: number;
}
