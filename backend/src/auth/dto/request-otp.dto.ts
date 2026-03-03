import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestOtpDto {
  @ApiProperty({ example: 'voter@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'login' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  purpose?: string;
}

