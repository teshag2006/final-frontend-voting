import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserEntity } from '@/entities/user.entity';
import { AuthOtpRequestEntity } from '@/entities/auth-otp-request.entity';
import { UserSessionEntity } from '@/entities/user-session.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { VoteWalletEntity } from '@/entities/vote-wallet.entity';
import { TenantEntity } from '@/entities/tenant.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { SponsorEntity } from '@/entities/sponsor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      AuthOtpRequestEntity,
      UserSessionEntity,
      CategoryEntity,
      VoteWalletEntity,
      TenantEntity,
      ContestantEntity,
      SponsorEntity,
    ]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION') || '24h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
