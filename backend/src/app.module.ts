import { Module } from '@nestjs/common';
import { DataStoreService } from './core/data-store.service';
import { AuthController } from './modules/auth.controller';
import { PublicController } from './modules/public.controller';
import { VoterController } from './modules/voter.controller';
import { ContestantController } from './modules/contestant.controller';
import { SponsorController } from './modules/sponsor.controller';
import { AdminController } from './modules/admin.controller';
import { UtilityController } from './modules/utility.controller';

@Module({
  controllers: [
    AuthController,
    PublicController,
    VoterController,
    ContestantController,
    SponsorController,
    AdminController,
    UtilityController,
  ],
  providers: [DataStoreService],
})
export class AppModule {}
