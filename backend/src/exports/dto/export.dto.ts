import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ExportStatus } from '@/entities/export.entity';

export class CreateExportDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  event_id: number;

  @ApiPropertyOptional({ example: 'leaderboard' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  export_type?: string;

  @ApiPropertyOptional({ example: 'csv' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  file_format?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/exports/e1.csv' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  file_url?: string;

  @ApiPropertyOptional({ example: 10240 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  file_size?: number;

  @ApiPropertyOptional({ enum: ExportStatus, example: ExportStatus.GENERATING })
  @IsOptional()
  @IsEnum(ExportStatus)
  export_status?: ExportStatus;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rows_exported?: number;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class UpdateExportDto {
  @ApiPropertyOptional({ example: 'leaderboard' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  export_type?: string;

  @ApiPropertyOptional({ example: 'xlsx' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  file_format?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/exports/e1.xlsx' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  file_url?: string;

  @ApiPropertyOptional({ example: 20480 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  file_size?: number;

  @ApiPropertyOptional({ enum: ExportStatus, example: ExportStatus.READY })
  @IsOptional()
  @IsEnum(ExportStatus)
  export_status?: ExportStatus;

  @ApiPropertyOptional({ example: 2500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rows_exported?: number;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @ApiPropertyOptional({ example: '2026-02-16T02:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  downloaded_at?: string;
}
