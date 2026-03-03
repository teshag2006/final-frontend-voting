import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisModule } from '@nestjs-modules/ioredis';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { EventsModule } from './events/events.module';
import { CategoriesModule } from './categories/categories.module';
import { ContestantsModule } from './contestants/contestants.module';
import { VotesModule } from './votes/votes.module';
import { PaymentsModule } from './payments/payments.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { FraudModule } from './fraud/fraud.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SystemModule } from './system/system.module';
import { SponsorsModule } from './sponsors/sponsors.module';
import { ExportsModule } from './exports/exports.module';
import { PaymentProvidersModule } from './payment-providers/payment-providers.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { VoterModule } from './voter/voter.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import { PublicModule } from './public/public.module';
import { AdminModule } from './admin/admin.module';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    // Configuration module - must be first
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting module for SMS/OTP protection
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 second
        limit: 3,    // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 60000,  // 1 minute
        limit: 10,   // 10 requests per minute
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 50,    // 50 requests per hour
      },
      // Strict OTP rate limiting: 1 OTP per 2 minutes per phone/email
      {
        name: 'otp',
        ttl: 120000,  // 2 minutes
        limit: 1,     // 1 request per 2 minutes
      },
    ]),

    // Redis for caching and queues
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single' as const,
        url: configService.get('REDIS_URL') ||
          `redis://${configService.get('REDIS_HOST', 'localhost')}:${configService.get('REDIS_PORT', '6379')}`,
      }),
    }),

    // BullMQ queue processing (uses Redis)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: parseInt(configService.get('REDIS_PORT', '6379'), 10),
        },
      }),
    }),

    // TypeORM database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    RolesModule,
    EventsModule,
    CategoriesModule,
    ContestantsModule,
    VotesModule,
    PaymentsModule,
    BlockchainModule,
    FraudModule,
    LeaderboardModule,
    NotificationsModule,
    SystemModule,
    SponsorsModule,
    ExportsModule,
    PaymentProvidersModule,
    WebhooksModule,
    VoterModule,
    AuditModule,
    HealthModule,
    PublicModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
