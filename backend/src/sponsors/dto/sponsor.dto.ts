import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import {
  SponsorAccountStatus,
  SponsorTier,
  SponsorVerificationStatus,
} from '@/entities/sponsor.entity';
import {
  SponsorDocumentType,
  SponsorDocumentVerificationStatus,
} from '@/entities/sponsor-document.entity';
import {
  ContestantIntegrityStatus,
} from '@/entities/contestant-integrity.entity';
import {
  CampaignPaymentStatus,
  CampaignStatus,
  CampaignType,
} from '@/entities/campaign.entity';

export class CreateSponsorDto {
  @ApiProperty({ example: 'Acme Corp' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  company_name?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contact_person_name?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  logo_url?: string;

  @ApiPropertyOptional({ example: 'https://acme.com' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  website_url?: string;

  @ApiPropertyOptional({ enum: SponsorTier, example: SponsorTier.GOLD })
  @IsOptional()
  @IsEnum(SponsorTier)
  tier?: SponsorTier;

  @ApiPropertyOptional({ example: 'partnership@acme.com' })
  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @ApiPropertyOptional({ example: '+12025550123' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone_number?: string;

  @ApiPropertyOptional({ example: 'Leading fintech sponsor' })
  @IsOptional()
  @IsString()
  company_description?: string;

  @ApiPropertyOptional({ example: 'Fintech' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry_category?: string;

  @ApiPropertyOptional({ example: '50-200' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  company_size?: string;

  @ApiPropertyOptional({ example: 'Ethiopia' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'Addis Ababa' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Bole Road' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address_line_1?: string;

  @ApiPropertyOptional({ example: 'Floor 2' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address_line_2?: string;

  @ApiPropertyOptional({ example: '1000' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  postal_code?: string;

  @ApiPropertyOptional({ example: 'TAX-123' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tax_id_number?: string;

  @ApiPropertyOptional({ example: 'REG-123' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  registration_number?: string;

  @ApiPropertyOptional({ enum: SponsorVerificationStatus, example: SponsorVerificationStatus.PENDING })
  @IsOptional()
  @IsEnum(SponsorVerificationStatus)
  verification_status?: SponsorVerificationStatus;

  @ApiPropertyOptional({ enum: SponsorAccountStatus, example: SponsorAccountStatus.ACTIVE })
  @IsOptional()
  @IsEnum(SponsorAccountStatus)
  account_status?: SponsorAccountStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ example: '2026-02-20T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduled_date?: string;

  @ApiPropertyOptional({ example: '2026-02-21T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  started_date?: string;

  @ApiPropertyOptional({ example: '2026-03-21T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  terminated_date?: string;
}

export class UpdateSponsorDto {
  @ApiPropertyOptional({ example: 'Acme Corp Updated' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Acme Corp Updated' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  company_name?: string;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contact_person_name?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo-v2.png' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  logo_url?: string;

  @ApiPropertyOptional({ example: 'https://acme.example' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  website_url?: string;

  @ApiPropertyOptional({ enum: SponsorTier, example: SponsorTier.PLATINUM })
  @IsOptional()
  @IsEnum(SponsorTier)
  tier?: SponsorTier;

  @ApiPropertyOptional({ example: 'hello@acme.com' })
  @IsOptional()
  @IsEmail()
  contact_email?: string;

  @ApiPropertyOptional({ example: '+12025550123' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone_number?: string;

  @ApiPropertyOptional({ example: 'Leading fintech sponsor' })
  @IsOptional()
  @IsString()
  company_description?: string;

  @ApiPropertyOptional({ example: 'Fintech' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry_category?: string;

  @ApiPropertyOptional({ example: '50-200' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  company_size?: string;

  @ApiPropertyOptional({ example: 'Ethiopia' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'Addis Ababa' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Bole Road' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address_line_1?: string;

  @ApiPropertyOptional({ example: 'Floor 2' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address_line_2?: string;

  @ApiPropertyOptional({ example: '1000' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  postal_code?: string;

  @ApiPropertyOptional({ example: 'TAX-123' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tax_id_number?: string;

  @ApiPropertyOptional({ example: 'REG-123' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  registration_number?: string;

  @ApiPropertyOptional({ enum: SponsorVerificationStatus, example: SponsorVerificationStatus.VERIFIED })
  @IsOptional()
  @IsEnum(SponsorVerificationStatus)
  verification_status?: SponsorVerificationStatus;

  @ApiPropertyOptional({ enum: SponsorAccountStatus, example: SponsorAccountStatus.ACTIVE })
  @IsOptional()
  @IsEnum(SponsorAccountStatus)
  account_status?: SponsorAccountStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ example: '2026-02-20T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduled_date?: string;

  @ApiPropertyOptional({ example: '2026-02-21T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  started_date?: string;

  @ApiPropertyOptional({ example: '2026-03-21T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  terminated_date?: string;
}

export class LinkEventSponsorDto {
  @ApiPropertyOptional({ example: 'homepage-banner' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  placement?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  display_order?: number;
}

export class CreateSponsorDocumentDto {
  @ApiProperty({ enum: SponsorDocumentType })
  @IsEnum(SponsorDocumentType)
  document_type: SponsorDocumentType;

  @ApiProperty({ example: 'https://cdn.example.com/docs/license.png' })
  @IsString()
  @MaxLength(512)
  file_url: string;

  @ApiPropertyOptional({ example: 'image/png' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mime_type?: string;

  @ApiPropertyOptional({ enum: SponsorDocumentVerificationStatus })
  @IsOptional()
  @IsEnum(SponsorDocumentVerificationStatus)
  verification_status?: SponsorDocumentVerificationStatus;
}

export class UpdateContestantIntegrityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  follower_spike_flag?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  vote_spike_flag?: boolean;

  @ApiPropertyOptional({ example: 0.72 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  engagement_ratio?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  suspicious_activity_score?: number;

  @ApiPropertyOptional({ example: 92 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  integrity_score?: number;

  @ApiPropertyOptional({ enum: ContestantIntegrityStatus })
  @IsOptional()
  @IsEnum(ContestantIntegrityStatus)
  status?: ContestantIntegrityStatus;

  @ApiPropertyOptional({ example: 45000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  total_followers?: number;

  @ApiPropertyOptional({ example: 240 })
  @IsOptional()
  @IsNumber()
  follower_growth_24h?: number;

  @ApiPropertyOptional({ example: 1200 })
  @IsOptional()
  @IsNumber()
  follower_growth_7d?: number;

  @ApiPropertyOptional({ example: 0.18 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  engagement_rate?: number;

  @ApiPropertyOptional({ example: 1.4 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  engagement_spike_factor?: number;

  @ApiPropertyOptional({ example: 180 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vote_velocity_24h?: number;

  @ApiPropertyOptional({ example: 920 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vote_velocity_7d?: number;
}

export class CreateCampaignDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  sponsor_id: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  contestant_id: number;

  @ApiProperty({ enum: CampaignType })
  @IsEnum(CampaignType)
  campaign_type: CampaignType;

  @ApiPropertyOptional({ example: 'Homepage banner + 2 reels' })
  @IsOptional()
  @IsString()
  deliverables?: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  agreed_price?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  commission_amount?: number;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ example: '2026-03-31T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  campaign_status?: CampaignStatus;

  @ApiPropertyOptional({ enum: CampaignPaymentStatus })
  @IsOptional()
  @IsEnum(CampaignPaymentStatus)
  payment_status?: CampaignPaymentStatus;
}

export class UpdateCampaignStatusDto {
  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsOptional()
  @IsEnum(CampaignStatus)
  campaign_status?: CampaignStatus;

  @ApiPropertyOptional({ enum: CampaignPaymentStatus })
  @IsOptional()
  @IsEnum(CampaignPaymentStatus)
  payment_status?: CampaignPaymentStatus;
}

export class CreateEnforcementLogDto {
  @ApiProperty({ example: 'social_lock_violation' })
  @IsString()
  @MaxLength(100)
  violation_type: string;

  @ApiPropertyOptional({ example: 'Attempted social handle update during active campaign' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  penalty_score?: number;

  @ApiPropertyOptional({ example: 'warning_issued' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  action_taken?: string;
}

export class RevenueAnalyticsQueryDto {
  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class InfluenceQueryDto {
  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  trending_threshold?: number;
}

