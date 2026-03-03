import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '@/entities/event.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { PaymentEntity } from '@/entities/payment.entity';
import { FraudLogEntity } from '@/entities/fraud-log.entity';
import { UserEntity } from '@/entities/user.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { BlockchainAnchorEntity } from '@/entities/blockchain-anchor.entity';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardController } from './admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      VoteEntity,
      PaymentEntity,
      FraudLogEntity,
      UserEntity,
      ContestantEntity,
      BlockchainAnchorEntity,
    ]),
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminModule {}
