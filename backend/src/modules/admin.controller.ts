import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DataStoreService } from '../core/data-store.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly db: DataStoreService) {}

  @Get('users')
  users() {
    return this.db.users;
  }

  @Get('roles')
  roles() {
    return ['admin', 'contestant', 'media', 'voter', 'sponsor'];
  }

  @Get('permissions')
  permissions() {
    return ['users.read', 'users.write', 'events.manage', 'moderation.manage'];
  }

  @Get('audit')
  audit() {
    return [{ id: 'audit-1', actor: 'admin-001', action: 'settings_updated', createdAt: new Date().toISOString() }];
  }

  @Post('audit')
  createAudit(@Body() body: Record<string, unknown>) {
    return { id: `audit-${Date.now()}`, ...body, createdAt: new Date().toISOString() };
  }

  @Get('sessions')
  sessions() {
    return [{ id: 'sess-1', userId: 'admin-001', ip: '127.0.0.1', status: 'active' }];
  }

  @Delete('sessions')
  deleteSessions(@Query('sessionId') sessionId?: string, @Query('userId') userId?: string) {
    return { revoked: sessionId || userId || null, sessions: [] };
  }

  @Get('settings')
  settings() {
    return { payment: { primaryProvider: 'chapa' }, security: { maxLoginAttempts: 5 } };
  }

  @Patch('settings')
  patchSettings(@Body() body: Record<string, unknown>) {
    return { success: true, settings: body };
  }

  @Patch('settings/maintenance')
  maintenance(@Body() body: Record<string, unknown>) {
    return { success: true, maintenance: body };
  }

  @Post('settings/maintenance')
  maintenancePost(@Body() body: Record<string, unknown>) {
    return { success: true, maintenance: body };
  }

  @Get('content')
  content() {
    return {
      homepage: { heroTitle: 'Where Influence Meets Integrity.' },
      navigationMenus: [{ id: 'nav-1', label: 'Events', href: '/events', visible: true, order: 1, position: 'header' }],
      sponsorBanners: [],
      footerLinks: [],
    };
  }

  @Patch('content')
  patchContent(@Body() body: Record<string, unknown>) {
    return { success: true, content: body };
  }

  @Post('content')
  createContent(@Body() body: Record<string, unknown>) {
    return { id: `content-${Date.now()}`, ...body };
  }

  @Get('sponsors')
  sponsors() {
    return [{ id: 'sp-1', name: 'Castaway Collective', status: 'active' }];
  }

  @Patch('sponsors')
  patchSponsors(@Body() body: Record<string, unknown>) {
    return { success: true, ...body };
  }

  @Get('sponsor-campaigns')
  sponsorCampaigns(@Query('eventSlug') eventSlug?: string) {
    return [{ id: 'camp-1', eventSlug: eventSlug || 'miss-africa-2026', status: 'active' }];
  }

  @Get('sponsor-placements')
  sponsorPlacements(@Query('contestantSlug') contestantSlug?: string) {
    return [{ id: 'place-1', contestantSlug: contestantSlug || 'lulit-bekele', slot: 'hero' }];
  }

  @Post('sponsors/impersonate')
  sponsorImpersonate(@Body() body: { sponsorId?: string }) {
    return { token: `mock-token-sponsor-${body.sponsorId || '001'}`, role: 'sponsor' };
  }

  @Get('contestants')
  contestants() {
    return this.db.contestants;
  }

  @Patch('contestants')
  patchContestant(@Body() body: Record<string, unknown>) {
    return { success: true, contestant: body };
  }

  @Post('contestants')
  createContestant(@Body() body: Record<string, unknown>) {
    return { id: `cont-${Date.now()}`, ...body };
  }

  @Delete('contestants')
  deleteContestant(@Body() body: { id?: string }) {
    return { success: true, id: body.id || null };
  }

  @Post('contestants/impersonate')
  contestantImpersonate(@Body() body: { contestantId?: string }) {
    return { token: `mock-token-contestant-${body.contestantId || '001'}`, role: 'contestant' };
  }

  @Get('contestant/publishing')
  publishingState() {
    return [{ contestantId: 'cont-1', isPublic: true }];
  }

  @Patch('contestant/publishing')
  patchPublishingState(@Body() body: Record<string, unknown>) {
    return { success: true, publishing: body };
  }

  @Get('contestant/change-requests')
  changeRequests() {
    return [{ id: 'cr-1', contestantId: 'cont-1', status: 'pending' }];
  }

  @Patch('contestant/change-requests/:requestId')
  patchChangeRequest(@Param('requestId') requestId: string, @Body() body: Record<string, unknown>) {
    return { id: requestId, ...body };
  }

  @Get('contestants/:contestantId/profile-video')
  contestantProfileVideo(@Param('contestantId') contestantId: string) {
    return { contestantId, introVideoUrl: '' };
  }

  @Patch('contestants/:contestantId/profile-video')
  patchContestantProfileVideo(
    @Param('contestantId') contestantId: string,
    @Body() body: { introVideoUrl?: string },
  ) {
    return { contestantId, introVideoUrl: body.introVideoUrl || '' };
  }
}
