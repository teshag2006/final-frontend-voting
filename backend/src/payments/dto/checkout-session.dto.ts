import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CheckoutSessionDto {
  @ApiProperty({ example: '10' })
  @IsString()
  contestantId: string;

  @ApiProperty({ example: 5, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}
