import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DataStoreService } from '../core/data-store.service';

@Controller()
export class UtilityController {
  constructor(private readonly db: DataStoreService) {}

  @Get('analytics')
  analytics() {
    return { visitors: 12034, votesToday: 2345, conversionRate: 7.2 };
  }

  @Post('analytics')
  trackAnalytics(@Body() body: Record<string, unknown>) {
    return { success: true, tracked: true, ...body };
  }

  @Get('analytics/events')
  analyticsEvents() {
    return [{ id: 'ev-analytics-1', type: 'page_view', path: '/events', createdAt: new Date().toISOString() }];
  }

  @Post('analytics/events')
  trackAnalyticsEvent(@Body() body: Record<string, unknown>) {
    return { success: true, eventId: `ev-${Date.now()}`, ...body };
  }

  @Get('leaderboard')
  leaderboard(@Query('eventSlug') eventSlug = 'miss-africa-2026') {
    return this.db.contestants
      .filter((c) => c.eventSlug === eventSlug)
      .sort((a, b) => b.votes - a.votes)
      .map((c, i) => ({ rank: i + 1, ...c }));
  }

  @Get('contestants/search')
  contestantSearch(@Query('q') q = '') {
    const needle = String(q).toLowerCase();
    return this.db.contestants.filter((c) => c.name.toLowerCase().includes(needle) || c.slug.toLowerCase().includes(needle));
  }

  @Post('upload/media')
  uploadMedia(@Body() body: Record<string, unknown>) {
    return { id: `upload-${Date.now()}`, ...body, url: 'https://picsum.photos/seed/upload/1200/800' };
  }

  @Get('errors')
  errors() {
    return { errors: [{ id: 'err-1', message: 'Sample backend error log', level: 'warn' }] };
  }

  @Post('errors')
  reportError(@Body() body: Record<string, unknown>) {
    return { success: true, id: `err-${Date.now()}`, ...body };
  }
}
