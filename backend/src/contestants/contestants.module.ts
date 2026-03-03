import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContestantEntity } from '@/entities/contestant.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { EventEntity } from '@/entities/event.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { MediaFileEntity } from '@/entities/media-file.entity';
import { CampaignEntity } from '@/entities/campaign.entity';
import { EnforcementLogEntity } from '@/entities/enforcement-log.entity';
import { ContestantsService } from './contestants.service';
import { ContestantsController } from './contestants.controller';
import { ContestantPortalController } from './contestants.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContestantEntity,
      CategoryEntity,
      EventEntity,
      VoteEntity,
      MediaFileEntity,
      CampaignEntity,
      EnforcementLogEntity,
    ]),
  ],
  providers: [ContestantsService],
  controllers: [ContestantsController, ContestantPortalController],
  exports: [ContestantsService],
})
export class ContestantsModule {}
