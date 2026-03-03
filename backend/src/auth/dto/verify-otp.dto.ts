import { IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'voter@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(4, 10)
  code: string;

  @ApiPropertyOptional({ example: 'login' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  purpose?: string;

  @ApiPropertyOptional({ example: 'canvas-fp-abc123' })
  @IsOptional()
  @IsString()
  device_fingerprint?: string;

  @ApiPropertyOptional({ example: '196.188.10.25' })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0' })
  @IsOptional()
  @IsString()
  user_agent?: string;
}

