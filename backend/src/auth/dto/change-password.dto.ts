import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentPass1!' })
  @IsString()
  @MinLength(8)
  current_password: string;

  @ApiProperty({ example: 'NewStrongPass1!' })
  @IsString()
  @MinLength(8)
  new_password: string;
}
