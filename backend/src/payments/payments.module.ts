import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PaymentEntity } from '@/entities/payment.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { VoteReceiptEntity } from '@/entities/vote-receipt.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { EventEntity } from '@/entities/event.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { RefundRequestEntity } from '@/entities/refund-request.entity';
import { PaymentWebhookEntity } from '@/entities/payment-webhook.entity';
import { VoteWalletEntity } from '@/entities/vote-wallet.entity';
import { VoteTransactionEntity } from '@/entities/vote-transaction.entity';
import { WalletVoteCreditEntity } from '@/entities/wallet-vote-credit.entity';
import { UserEntity } from '@/entities/user.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { ChapaService } from './chapa.service';
import { TelebirrService } from './telebirr.service';
import { SantimPayService } from './santimpay.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentEntity,
      VoteEntity,
      VoteReceiptEntity,
      ContestantEntity,
      EventEntity,
      CategoryEntity,
      RefundRequestEntity,
      PaymentWebhookEntity,
      VoteWalletEntity,
      VoteTransactionEntity,
      WalletVoteCreditEntity,
      UserEntity,
    ]),
    ConfigModule,
    HttpModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, ChapaService, TelebirrService, SantimPayService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
