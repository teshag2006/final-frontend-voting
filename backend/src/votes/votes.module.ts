import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteEntity } from '@/entities/vote.entity';
import { VoteReceiptEntity } from '@/entities/vote-receipt.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { EventEntity } from '@/entities/event.entity';
import { UserEntity } from '@/entities/user.entity';
import { FraudModule } from '@/fraud/fraud.module';
import { LeaderboardModule } from '@/leaderboard/leaderboard.module';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VoteEntity,
      VoteReceiptEntity,
      ContestantEntity,
      CategoryEntity,
      EventEntity,
      UserEntity,
    ]),
    FraudModule,
    LeaderboardModule,
  ],
  providers: [VotesService],
  controllers: [VotesController],
  exports: [VotesService],
})
export class VotesModule {}
