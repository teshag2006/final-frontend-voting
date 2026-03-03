import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ContestantEntity } from '@/entities/contestant.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { EventEntity } from '@/entities/event.entity';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardGateway } from './leaderboard.gateway';
import { LeaderboardAdminController } from './leaderboard.controller';
import { LeaderboardPublicController } from './leaderboard.controller';
import { LeaderboardMediaController } from './leaderboard.controller';
import { LeaderboardRootController } from './leaderboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContestantEntity,
      VoteEntity,
      CategoryEntity,
      EventEntity,
    ]),
    JwtModule,
  ],
  controllers: [
    LeaderboardAdminController,
    LeaderboardPublicController,
    LeaderboardMediaController,
    LeaderboardRootController,
  ],
  providers: [LeaderboardService, LeaderboardGateway],
  exports: [LeaderboardService, LeaderboardGateway],
})
export class LeaderboardModule {}
