import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  MaxLength,
  MinLength,
  IsUrl,
  IsEmail,
} from 'class-validator';
import { ContestantStatus, VerificationStatus } from '@/entities/contestant.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContestantDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  event_id: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  category_id: number;

  @ApiProperty({ example: 'Abel' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  first_name: string;

  @ApiProperty({ example: 'Kebede' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  last_name: string;

  @ApiPropertyOptional({ example: 'Biography text' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  biography?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/contestant.jpg' })
  @IsOptional()
  @IsUrl()
  profile_image_url?: string;

  @ApiPropertyOptional({ example: 'contestant@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+251911000000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Dancing queen from Addis Ababa', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tagline?: string;

  @ApiPropertyOptional({ example: 'Ethiopia', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    type: Object,
    example: { instagram: '@contestant', tiktok: '@contestant' },
  })
  @IsOptional()
  social_media_handles?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
}

export class UpdateContestantDto {
  @ApiPropertyOptional({ example: 'Abel' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  first_name?: string;

  @ApiPropertyOptional({ example: 'Kebede' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  last_name?: string;

  @ApiPropertyOptional({ example: 'Updated biography text' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  biography?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/contestant.jpg' })
  @IsOptional()
  @IsUrl()
  profile_image_url?: string;

  @ApiPropertyOptional({ example: 'contestant@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+251911000000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Dancing queen from Addis Ababa', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  tagline?: string;

  @ApiPropertyOptional({ example: 'Ethiopia', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    type: Object,
    example: { instagram: '@contestant', tiktok: '@contestant' },
  })
  @IsOptional()
  social_media_handles?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };

  @ApiPropertyOptional({ enum: ContestantStatus, example: ContestantStatus.APPROVED })
  @IsOptional()
  @IsEnum(ContestantStatus)
  status?: ContestantStatus;

  @ApiPropertyOptional({ enum: VerificationStatus, example: VerificationStatus.VERIFIED })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verification_status?: VerificationStatus;
}

export class ContestantResponseDto {
  id: number;
  event_id: number;
  category_id: number;
  // Slug-based routing fields
  slug?: string;
  event_slug?: string;
  event_name?: string;
  category_name?: string;
  // Computed full name (frontend mock uses `name` field)
  name?: string;
  first_name: string;
  last_name: string;
  biography?: string;
  // photo_url alias for profile_image_url (frontend mock uses photo_url)
  photo_url?: string;
  profile_image_url?: string;
  email?: string;
  phone?: string;
  country?: string;
  tagline?: string;
  // Computed age from date_of_birth
  age?: number;
  social_media_handles?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
  status: ContestantStatus;
  verification_status: VerificationStatus;
  // Boolean alias (frontend mock uses is_verified)
  is_verified?: boolean;
  vote_count: number;
  paid_vote_count: number;
  free_vote_count: number;
  // Frontend mock field name aliases
  total_votes?: number;
  total_paid_votes?: number;
  total_free_votes?: number;
  // Today's votes (computed by service)
  votes_today?: number;
  // Rank fields (computed by service)
  rank?: number;
  rank_overall?: number;
  rank_in_category?: number;
  vote_percentage?: number;
  total_revenue: number;
  // Gallery from MediaFileEntity
  gallery_photos?: string[];
  video_url?: string;
  video_thumbnail?: string;
  // Blockchain hash from latest anchor
  blockchain_hash?: string;
  // Sponsors via campaigns
  sponsors?: { id: number; name: string; logo_url?: string }[];
  created_at: Date;
  updated_at: Date;
}

export class ContestantStatsDto {
  id: number;
  name: string;
  votes: number;
  paidVotes: number;
  freeVotes: number;
  revenue: number;
  rank: number;
  votesToday?: number;
  rankOverall?: number;
  rankInCategory?: number;
  votePercentage?: number;
}
