import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  MaxLength,
  MinLength,
  IsNumber,
  IsBoolean,
  IsArray,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus } from '@/entities/event.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Innovation Awards 2026' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'innovation-awards-2026' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ example: 'Annual innovation event' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start_date?: Date;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_date?: Date;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  voting_start?: Date;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  voting_end?: Date;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsNumber()
  season?: number;

  @ApiPropertyOptional({ enum: EventStatus, example: EventStatus.DRAFT })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ example: 'One vote per user per category' })
  @IsOptional()
  @IsString()
  voting_rules?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  allow_write_ins?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Tenant ID. If omitted, default tenant is used.' })
  @IsOptional()
  @IsNumber()
  tenant_id?: number;

  @ApiPropertyOptional({ example: 'Where talent meets opportunity', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tagline?: string;

  @ApiPropertyOptional({ example: 'Acme Productions', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizer_name?: string;

  @ApiPropertyOptional({ example: 0.1, description: 'Base price per vote (USD)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  vote_price?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum votes allowed per transaction' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  max_votes_per_transaction?: number;

  @ApiPropertyOptional({
    type: 'array',
    example: [{ votes: 10, price: 1.0, label: '10 Votes' }],
    description: 'Custom vote package tiers; if empty, defaults are derived from vote_price',
  })
  @IsOptional()
  @IsArray()
  vote_packages?: { votes: number; price: number; label: string }[];
}

export class UpdateEventDto {
  @ApiPropertyOptional({ example: 'Innovation Awards 2026' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  start_date?: Date;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  end_date?: Date;

  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  voting_start?: Date;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  voting_end?: Date;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsNumber()
  season?: number;

  @ApiPropertyOptional({ enum: EventStatus, example: EventStatus.ACTIVE })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({ example: 'Voting rules text' })
  @IsOptional()
  @IsString()
  voting_rules?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  allow_write_ins?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @ApiPropertyOptional({ example: 'Where talent meets opportunity', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tagline?: string;

  @ApiPropertyOptional({ example: 'Acme Productions', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizer_name?: string;

  @ApiPropertyOptional({ example: 0.1 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  vote_price?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  max_votes_per_transaction?: number;

  @ApiPropertyOptional({ type: 'array', example: [{ votes: 10, price: 1.0, label: '10 Votes' }] })
  @IsOptional()
  @IsArray()
  vote_packages?: { votes: number; price: number; label: string }[];
}

export class CreateCategoryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  event_id: number;

  @ApiProperty({ example: 'Best Innovation' })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  voting_enabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  public_voting?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  paid_voting?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  minimum_vote_amount?: number;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsNumber()
  daily_vote_limit?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  max_votes_per_user?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Best Innovation' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  voting_enabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  public_voting?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  paid_voting?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  minimum_vote_amount?: number;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsNumber()
  daily_vote_limit?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  max_votes_per_user?: number;
}

export class EventResponseDto {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: 1 })
  tenant_id: number;
  @ApiProperty({ example: 'Innovation Awards 2026' })
  name: string;
  @ApiProperty({ example: 'innovation-awards-2026' })
  slug: string;
  @ApiPropertyOptional({ example: 'Annual innovation event' })
  description?: string;
  @ApiPropertyOptional({ example: 'Vote for your favourite!' })
  tagline?: string;
  @ApiPropertyOptional({ example: 'Miss Africa Organization' })
  organizer_name?: string;
  @ApiPropertyOptional({ example: 'Nairobi, Kenya' })
  location?: string;
  @ApiPropertyOptional({ example: 1.00 })
  vote_price?: number;
  @ApiPropertyOptional({ example: 100 })
  max_votes_per_transaction?: number;
  @ApiPropertyOptional({ example: [{ votes: 10, price: 1.00, label: '10 Votes' }] })
  vote_packages?: { votes: number; price: number; label: string }[];
  @ApiProperty({ enum: EventStatus, example: EventStatus.ACTIVE })
  status: EventStatus;
  @ApiProperty({ example: true })
  is_live: boolean;
  @ApiPropertyOptional({ example: 2026 })
  season?: number;
  @ApiPropertyOptional({ example: 2026 })
  season_year?: number;
  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  start_date?: Date;
  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  end_date?: Date;
  @ApiPropertyOptional({ example: '2026-02-01T00:00:00.000Z' })
  voting_start?: Date;
  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  voting_end?: Date;
  @ApiProperty({ example: 1 })
  creator_id: number;
  @ApiPropertyOptional({ example: 'One vote per user per category' })
  voting_rules?: string;
  @ApiProperty({ example: false })
  allow_write_ins: boolean;
  @ApiProperty({ example: true })
  is_public: boolean;
  @ApiPropertyOptional({ example: 'https://cdn.example.com/banner.jpg' })
  banner_url?: string;
  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  created_at: Date;
  @ApiProperty({ example: '2026-01-02T10:00:00.000Z' })
  updated_at: Date;
}

export class CategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: 1 })
  event_id: number;
  @ApiPropertyOptional({ example: 'best-innovation' })
  slug?: string | null;
  @ApiProperty({ example: 'Best Innovation' })
  name: string;
  @ApiPropertyOptional({ example: 'Category description' })
  description?: string;
  @ApiProperty({ example: true })
  voting_enabled: boolean;
  @ApiProperty({ example: true })
  public_voting: boolean;
  @ApiProperty({ example: true })
  paid_voting: boolean;
  @ApiPropertyOptional({ example: 1 })
  minimum_vote_amount?: number;
  @ApiPropertyOptional({ example: 10000 })
  daily_vote_limit?: number;
  @ApiPropertyOptional({ example: 10 })
  max_votes_per_user?: number;
  @ApiProperty({ example: '2026-01-01T10:00:00.000Z' })
  created_at: Date;
  @ApiProperty({ example: '2026-01-02T10:00:00.000Z' })
  updated_at: Date;
}
