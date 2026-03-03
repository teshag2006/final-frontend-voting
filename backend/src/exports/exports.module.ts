import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { ExportEntity } from '@/entities/export.entity';
import { EventEntity } from '@/entities/event.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { PaymentEntity } from '@/entities/payment.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { ExportsProcessor } from './exports.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExportEntity, EventEntity, VoteEntity, PaymentEntity, ContestantEntity]),
    BullModule.registerQueue({ name: 'exports' }),
  ],
  providers: [ExportsService, ExportsProcessor],
  controllers: [ExportsController],
  exports: [ExportsService],
})
export class ExportsModule {}
