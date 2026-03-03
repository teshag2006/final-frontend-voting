import { Module } from '@nestjs/common';
import { EventsModule } from '@/events/events.module';
import { ContestantsModule } from '@/contestants/contestants.module';
import { LeaderboardModule } from '@/leaderboard/leaderboard.module';
import { SponsorsModule } from '@/sponsors/sponsors.module';
import { CategoriesModule } from '@/categories/categories.module';
import { VoterModule } from '@/voter/voter.module';
import { PublicController } from './public.controller';

@Module({
  imports: [
    EventsModule,
    ContestantsModule,
    LeaderboardModule,
    SponsorsModule,
    CategoriesModule,
    VoterModule,
  ],
  controllers: [PublicController],
})
export class PublicModule {}
