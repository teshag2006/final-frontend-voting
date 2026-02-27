import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DataStoreService } from '../core/data-store.service';

@Controller('sponsor')
export class SponsorController {
  constructor(private readonly db: DataStoreService) {}

  @Get('overview')
  overview() {
    return { activeCampaigns: 3, spendMonthToDate: 5400, avgCpc: 0.24 };
  }

  @Get('discover')
  discover(@Query('query') query?: string) {
    const q = String(query || '').toLowerCase();
    return this.db.contestants
      .filter((c) => (!q ? true : c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)))
      .map((c, idx) => ({
        slug: c.slug,
        name: c.name,
        category: c.category,
        rank: idx + 1,
        votes: c.votes,
        profileImage: c.image_url,
        integrityStatus: 'verified',
        integrityScore: 95,
        tier: 'A',
        engagementRate: 4.3,
      }));
  }

  @Get('settings')
  settings() {
    return { companyName: 'Demo Sponsor Inc', email: 'sponsor@example.com', budgetMonthly: 10000 };
  }

  @Patch('settings')
  patchSettings(@Body() body: Record<string, unknown>) {
    return { success: true, settings: body };
  }

  @Get('campaigns')
  campaigns(@Query('contestant') contestant?: string) {
    const contestantSlug = String(contestant || 'lulit-bekele');
    return [{ id: 'camp-1', contestantSlug, title: 'Brand Awareness', status: 'active', spend: 1200 }];
  }

  @Post('campaigns')
  createCampaign(@Body() body: Record<string, unknown>) {
    return { id: `camp-${Date.now()}`, ...body, createdAt: new Date().toISOString() };
  }

  @Get('audit')
  audit() {
    return [{ id: 's-a-1', action: 'campaign_created', createdAt: new Date().toISOString() }];
  }

  @Get('contestants/:contestantSlug')
  contestant(@Param('contestantSlug') contestantSlug: string) {
    const c = this.db.contestants.find((x) => x.slug === contestantSlug);
    if (!c) return null;
    return {
      slug: c.slug,
      name: c.name,
      category: c.category,
      votes: c.votes,
      profileImage: c.image_url,
      integrityStatus: 'verified',
      integrityScore: 95,
      tier: 'A',
    };
  }
}
