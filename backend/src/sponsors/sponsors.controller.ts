import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/entities/user.entity';
import { SponsorsService } from './sponsors.service';
import {
  CreateCampaignDto,
  CreateEnforcementLogDto,
  CreateSponsorDto,
  CreateSponsorDocumentDto,
  InfluenceQueryDto,
  LinkEventSponsorDto,
  RevenueAnalyticsQueryDto,
  UpdateCampaignStatusDto,
  UpdateContestantIntegrityDto,
  UpdateSponsorDto,
} from './dto/sponsor.dto';
import {
  CampaignStatus,
} from '@/entities/campaign.entity';
import { EnforcementEntityType } from '@/entities/enforcement-log.entity';

@Controller('sponsors')
export class SponsorsController {
  constructor(private sponsorsService: SponsorsService) {}

  @Get()
  async getSponsors(
    @Query('active') active?: string,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const isActive =
      active === undefined ? undefined : active === 'true' || active === '1';
    const sponsors = await this.sponsorsService.listSponsors(isActive);
    return {
      statusCode: 200,
      message: 'Sponsors retrieved successfully',
      data: sponsors,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async getSponsor(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const sponsor = await this.sponsorsService.getSponsorById(id);
    return {
      statusCode: 200,
      message: 'Sponsor retrieved successfully',
      data: sponsor,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createSponsor(
    @Body() dto: CreateSponsorDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const sponsor = await this.sponsorsService.createSponsor(dto);
    return {
      statusCode: 201,
      message: 'Sponsor created successfully',
      data: sponsor,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateSponsor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSponsorDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const sponsor = await this.sponsorsService.updateSponsor(id, dto);
    return {
      statusCode: 200,
      message: 'Sponsor updated successfully',
      data: sponsor,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSponsor(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.sponsorsService.deleteSponsor(id);
  }

  @Get('events/:eventId')
  async getEventSponsors(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const links = await this.sponsorsService.listEventSponsors(eventId);
    return {
      statusCode: 200,
      message: 'Event sponsors retrieved successfully',
      data: links,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('events/:eventId/:sponsorId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async linkSponsor(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('sponsorId', ParseIntPipe) sponsorId: number,
    @Body() dto: LinkEventSponsorDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const link = await this.sponsorsService.linkSponsorToEvent(eventId, sponsorId, dto);
    return {
      statusCode: 201,
      message: 'Sponsor linked to event successfully',
      data: link,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('events/:eventId/:sponsorId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlinkSponsor(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('sponsorId', ParseIntPipe) sponsorId: number,
  ): Promise<void> {
    await this.sponsorsService.unlinkSponsorFromEvent(eventId, sponsorId);
  }

  @Get(':id/documents')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSponsorDocuments(
    @Param('id', ParseIntPipe) sponsorId: number,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const docs = await this.sponsorsService.listSponsorDocuments(sponsorId);
    return {
      statusCode: 200,
      message: 'Sponsor documents retrieved successfully',
      data: docs,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/documents')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async addSponsorDocument(
    @Param('id', ParseIntPipe) sponsorId: number,
    @Body() dto: CreateSponsorDocumentDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const doc = await this.sponsorsService.addSponsorDocument(sponsorId, dto);
    return {
      statusCode: 201,
      message: 'Sponsor document added successfully',
      data: doc,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('contestants/:contestantId/integrity')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async upsertContestantIntegrity(
    @Param('contestantId', ParseIntPipe) contestantId: number,
    @Body() dto: UpdateContestantIntegrityDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const integrity = await this.sponsorsService.upsertContestantIntegrity(
      contestantId,
      dto,
    );
    return {
      statusCode: 200,
      message: 'Contestant integrity updated successfully',
      data: integrity,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('contestants/:contestantId/influence')
  async getContestantInfluence(
    @Param('contestantId', ParseIntPipe) contestantId: number,
    @Query() query: InfluenceQueryDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const data = await this.sponsorsService.getContestantInfluence(
      contestantId,
      query.trending_threshold ?? 60,
    );
    return {
      statusCode: 200,
      message: 'Contestant influence metrics retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('campaigns')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createCampaign(
    @Body() dto: CreateCampaignDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const campaign = await this.sponsorsService.createCampaign(dto);
    return {
      statusCode: 201,
      message: 'Campaign created successfully',
      data: campaign,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('campaigns')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async listCampaigns(
    @Query('sponsor_id') sponsorId?: string,
    @Query('contestant_id') contestantId?: string,
    @Query('campaign_status') campaignStatus?: CampaignStatus,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const campaigns = await this.sponsorsService.listCampaigns(
      sponsorId ? Number(sponsorId) : undefined,
      contestantId ? Number(contestantId) : undefined,
      campaignStatus,
    );
    return {
      statusCode: 200,
      message: 'Campaigns retrieved successfully',
      data: campaigns,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('campaigns/:campaignId')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCampaign(
    @Param('campaignId', ParseIntPipe) campaignId: number,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const campaign = await this.sponsorsService.getCampaignById(campaignId);
    return {
      statusCode: 200,
      message: 'Campaign retrieved successfully',
      data: campaign,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('campaigns/:campaignId/status')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateCampaignStatus(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Body() dto: UpdateCampaignStatusDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const campaign = await this.sponsorsService.updateCampaignStatus(campaignId, dto);
    return {
      statusCode: 200,
      message: 'Campaign status updated successfully',
      data: campaign,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('campaigns/:campaignId/activate')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async activateCampaign(
    @Param('campaignId', ParseIntPipe) campaignId: number,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const campaign = await this.sponsorsService.activateCampaign(campaignId);
    return {
      statusCode: 200,
      message: 'Campaign activated successfully',
      data: campaign,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('campaigns/:campaignId/complete')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async completeCampaign(
    @Param('campaignId', ParseIntPipe) campaignId: number,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const campaign = await this.sponsorsService.completeCampaign(campaignId);
    return {
      statusCode: 200,
      message: 'Campaign completed successfully',
      data: campaign,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/enforcement')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createSponsorEnforcement(
    @Param('id', ParseIntPipe) sponsorId: number,
    @Body() dto: CreateEnforcementLogDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const log = await this.sponsorsService.createEnforcementLogForSponsor(
      sponsorId,
      dto,
    );
    return {
      statusCode: 201,
      message: 'Sponsor enforcement log created successfully',
      data: log,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('contestants/:contestantId/enforcement')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createContestantEnforcement(
    @Param('contestantId', ParseIntPipe) contestantId: number,
    @Body() dto: CreateEnforcementLogDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const log = await this.sponsorsService.createEnforcementLogForContestant(
      contestantId,
      dto,
    );
    return {
      statusCode: 201,
      message: 'Contestant enforcement log created successfully',
      data: log,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('enforcement/logs')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getEnforcementLogs(
    @Query('entity_type') entityType?: EnforcementEntityType,
    @Query('entity_id') entityId?: string,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const logs = await this.sponsorsService.listEnforcementLogs(
      entityType,
      entityId ? Number(entityId) : undefined,
    );
    return {
      statusCode: 200,
      message: 'Enforcement logs retrieved successfully',
      data: logs,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/trust/sync')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async syncSponsorTrust(
    @Param('id', ParseIntPipe) sponsorId: number,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const trust = await this.sponsorsService.syncSponsorTrustProfile(sponsorId);
    return {
      statusCode: 200,
      message: 'Sponsor trust profile synced successfully',
      data: trust,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('analytics/revenue')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getRevenueAnalytics(
    @Query() query: RevenueAnalyticsQueryDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const data = await this.sponsorsService.getRevenueIntelligence(
      query.from,
      query.to,
    );
    return {
      statusCode: 200,
      message: 'Revenue intelligence retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
