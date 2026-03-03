import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SponsorEntity } from '@/entities/sponsor.entity';
import { EventSponsorEntity } from '@/entities/event-sponsor.entity';
import { EventEntity } from '@/entities/event.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { SponsorDocumentEntity } from '@/entities/sponsor-document.entity';
import { ContestantIntegrityEntity } from '@/entities/contestant-integrity.entity';
import { ContestantTierEntity } from '@/entities/contestant-tier.entity';
import { CampaignEntity } from '@/entities/campaign.entity';
import { CampaignSnapshotEntity } from '@/entities/campaign-snapshot.entity';
import { CampaignReportEntity } from '@/entities/campaign-report.entity';
import { SponsorTrustProfileEntity } from '@/entities/sponsor-trust-profile.entity';
import { EnforcementLogEntity } from '@/entities/enforcement-log.entity';
import { SponsorImpressionEntity } from '@/entities/sponsor-impression.entity';
import { SponsorClickEntity } from '@/entities/sponsor-click.entity';
import { SponsorsService } from './sponsors.service';
import { SponsorsController } from './sponsors.controller';
import { SponsorPortalController } from './sponsor-portal.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SponsorEntity,
      EventSponsorEntity,
      EventEntity,
      ContestantEntity,
      VoteEntity,
      SponsorDocumentEntity,
      ContestantIntegrityEntity,
      ContestantTierEntity,
      CampaignEntity,
      CampaignSnapshotEntity,
      CampaignReportEntity,
      SponsorTrustProfileEntity,
      EnforcementLogEntity,
      SponsorImpressionEntity,
      SponsorClickEntity,
    ]),
  ],
  providers: [SponsorsService],
  controllers: [SponsorsController, SponsorPortalController],
  exports: [SponsorsService],
})
export class SponsorsModule {}
