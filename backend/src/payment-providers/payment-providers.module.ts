import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentProviderEntity } from '@/entities/payment-provider.entity';
import { PaymentProvidersService } from './payment-providers.service';
import { PaymentProvidersController } from './payment-providers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentProviderEntity])],
  providers: [PaymentProvidersService],
  controllers: [PaymentProvidersController],
  exports: [PaymentProvidersService],
})
export class PaymentProvidersModule {}
