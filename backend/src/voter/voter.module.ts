import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteWalletEntity } from '@/entities/vote-wallet.entity';
import { VoteTransactionEntity } from '@/entities/vote-transaction.entity';
import { WalletVoteCreditEntity } from '@/entities/wallet-vote-credit.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { PaymentEntity } from '@/entities/payment.entity';
import { UserEntity } from '@/entities/user.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { EventEntity } from '@/entities/event.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { VoteReceiptEntity } from '@/entities/vote-receipt.entity';
import { VotesModule } from '@/votes/votes.module';
import { VoterController } from './voter.controller';
import { VoterService } from './voter.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VoteWalletEntity,
      VoteTransactionEntity,
      WalletVoteCreditEntity,
      VoteEntity,
      PaymentEntity,
      UserEntity,
      ContestantEntity,
      EventEntity,
      CategoryEntity,
      VoteReceiptEntity,
    ]),
    VotesModule,
  ],
  controllers: [VoterController],
  providers: [VoterService],
  exports: [VoterService],
})
export class VoterModule {}
