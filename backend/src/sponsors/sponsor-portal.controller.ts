import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UserEntity } from '@/entities/user.entity';
import { SponsorsService } from './sponsors.service';

@Controller('sponsor')
@UseGuards(JwtGuard)
export class SponsorPortalController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @Get('overview')
  async getOverview(@CurrentUser() user: UserEntity) {
    return {
      statusCode: 200,
      message: 'Sponsor overview retrieved successfully',
      data: await this.sponsorsService.getSponsorOverviewForUser(user.id),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('discover')
  async discoverContestants() {
    return {
      statusCode: 200,
      message: 'Sponsor contestants retrieved successfully',
      data: await this.sponsorsService.getSponsorDiscoverContestants(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('campaigns')
  async getCampaigns(
    @CurrentUser() user: UserEntity,
    @Query('contestant') contestantSlug?: string,
  ) {
    return {
      statusCode: 200,
      message: 'Sponsor campaigns retrieved successfully',
      data: await this.sponsorsService.getSponsorCampaignTracking(
        user.id,
        contestantSlug,
      ),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('campaigns')
  async createCampaign(
    @CurrentUser() user: UserEntity,
    @Body() payload: Record<string, unknown>,
  ) {
    return {
      statusCode: 201,
      message: 'Sponsor campaign request created successfully',
      data: await this.sponsorsService.createSponsorCampaignFromUi(user.id, payload),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('settings')
  async getSettings(@CurrentUser() user: UserEntity) {
    return {
      statusCode: 200,
      message: 'Sponsor settings retrieved successfully',
      data: await this.sponsorsService.getSponsorProfileSettingsForUser(user.id),
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('settings')
  async patchSettings(
    @CurrentUser() user: UserEntity,
    @Body() payload: Record<string, unknown>,
  ) {
    return {
      statusCode: 200,
      message: 'Sponsor settings updated successfully',
      data: await this.sponsorsService.saveSponsorProfileSettingsForUser(
        user.id,
        payload,
      ),
      timestamp: new Date().toISOString(),
    };
  }

  @Put('settings')
  async putSettings(
    @CurrentUser() user: UserEntity,
    @Body() payload: Record<string, unknown>,
  ) {
    return {
      statusCode: 200,
      message: 'Sponsor settings updated successfully',
      data: await this.sponsorsService.saveSponsorProfileSettingsForUser(
        user.id,
        payload,
      ),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('audit')
  async getAuditTrail(@CurrentUser() user: UserEntity) {
    return {
      statusCode: 200,
      message: 'Sponsor audit trail retrieved successfully',
      data: await this.sponsorsService.getSponsorAuditTrailForUser(user.id),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('contestants/:contestantSlug')
  async getContestantDetail(@Param('contestantSlug') contestantSlug: string) {
    return {
      statusCode: 200,
      message: 'Sponsor contestant detail retrieved successfully',
      data: await this.sponsorsService.getSponsorContestantDetailBySlug(
        contestantSlug,
      ),
      timestamp: new Date().toISOString(),
    };
  }
}
