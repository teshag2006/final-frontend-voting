import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class LogoutDto {
  @ApiPropertyOptional({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  refresh_token?: string;

  @ApiPropertyOptional({ example: 'canvas-fp-abc123' })
  @IsOptional()
  @IsString()
  device_fingerprint?: string;
}

