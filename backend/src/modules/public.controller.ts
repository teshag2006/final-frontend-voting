import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { DataStoreService } from '../core/data-store.service';

@Controller('public')
export class PublicController {
  constructor(private readonly db: DataStoreService) {}

  @Get('events')
  events() {
    return this.db.events;
  }

  @Get('active-event')
  activeEvent() {
    return this.db.events.find((e) => e.status === 'LIVE') || this.db.events[0];
  }

  @Get('event/:eventSlug')
  eventBySlug(@Param('eventSlug') eventSlug: string) {
    return this.db.events.find((e) => e.slug === eventSlug) || null;
  }

  @Get('event/:eventSlug/stats')
  eventStats(@Param('eventSlug') eventSlug: string) {
    const contestants = this.db.contestants.filter((c) => c.eventSlug === eventSlug);
    const totalVotes = contestants.reduce((sum, c) => sum + c.votes, 0);
    return {
      total_votes: totalVotes,
      total_contestants: contestants.length,
      active_categories: this.db.categories.length,
      votes_today: Math.max(0, Math.floor(totalVotes * 0.07)),
    };
  }

  @Get('event/:eventSlug/categories')
  eventCategories(@Param('eventSlug') eventSlug: string) {
    return this.db.categories.map((c, i) => ({
      ...c,
      event_id: eventSlug,
      contestant_count: this.db.contestants.filter((x) => x.eventSlug === eventSlug && x.category.toLowerCase() === c.name.toLowerCase()).length,
      image_url: `https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&h=800&fit=crop&sig=${i + 1}`,
    }));
  }

  @Get('event/:eventSlug/contestants')
  eventContestants(@Param('eventSlug') eventSlug: string) {
    return this.db.contestants.filter((c) => c.eventSlug === eventSlug);
  }

  @Get('event/:eventSlug/leaderboard')
  eventLeaderboard(@Param('eventSlug') eventSlug: string, @Query('limit') limit = '5') {
    const n = Math.max(1, Number(limit || 5));
    return this.db.contestants
      .filter((c) => c.eventSlug === eventSlug)
      .sort((a, b) => b.votes - a.votes)
      .slice(0, n)
      .map((c, i) => ({ rank: i + 1, contestant_id: c.id, name: c.name, category_name: c.category, total_votes: c.votes, photo_url: c.image_url }));
  }

  @Get('event/:eventSlug/faq')
  eventFaq() {
    return [{ id: 'faq-1', question: 'How voting works?', answer: 'Each vote is counted in real-time.' }];
  }

  @Get('event/:eventSlug/contestant/:contestantSlug')
  contestantProfile(@Param('contestantSlug') contestantSlug: string) {
    return this.db.contestants.find((c) => c.slug === contestantSlug) || null;
  }

  @Get('event/:eventSlug/contestant/:contestantSlug/stats')
  contestantStats(@Param('contestantSlug') contestantSlug: string) {
    const c = this.db.contestants.find((x) => x.slug === contestantSlug);
    if (!c) return null;
    return { total_votes: c.votes, rank: 1, vote_percentage: 12.4, trend_7d: [1, 3, 2, 5, 8, 13, 21] };
  }

  @Get('event/:eventSlug/vote-packages')
  votePackages() {
    return [
      { id: 'pkg-10', quantity: 10, price: 20, label: 'Starter' },
      { id: 'pkg-25', quantity: 25, price: 50, label: 'Standard' },
      { id: 'pkg-50', quantity: 50, price: 100, label: 'Pro' },
    ];
  }

  @Get('event/:eventSlug/contestant/:contestantSlug/geographic-support')
  geographicSupport() {
    return { countries: [{ country: 'Ethiopia', votes: 12000 }, { country: 'Kenya', votes: 7000 }] };
  }

  @Get('event/:eventSlug/contestant/:contestantSlug/related')
  relatedContestants(@Param('eventSlug') eventSlug: string, @Param('contestantSlug') contestantSlug: string) {
    return this.db.contestants.filter((c) => c.eventSlug === eventSlug && c.slug !== contestantSlug).slice(0, 4);
  }

  @Get('category-info/:categoryId')
  categoryInfo(@Param('categoryId') categoryId: string) {
    const category = this.db.categories.find((c) => c.id === categoryId || c.slug === categoryId);
    return category ? { id: category.id, slug: category.slug, name: category.name, description: category.description } : null;
  }

  @Get('category-contestants/:categoryId')
  categoryContestants(@Param('categoryId') categoryId: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    const c = this.db.categories.find((x) => x.id === categoryId || x.slug === categoryId);
    if (!c) return { data: [], total: 0, page: 1, limit: 20, total_pages: 0 };
    const rows = this.db.contestants.filter((x) => x.category.toLowerCase() === c.name.toLowerCase());
    const p = Math.max(1, Number(page || 1));
    const l = Math.max(1, Number(limit || 20));
    return { data: rows.slice((p - 1) * l, p * l), total: rows.length, page: p, limit: l, total_pages: Math.ceil(rows.length / l) };
  }

  @Get('event/:eventSlug/sponsors')
  eventSponsors(@Param('eventSlug') eventSlug: string) {
    return [{ id: `sp-${eventSlug}-1`, name: 'Castaway Collective', logo_url: 'https://picsum.photos/200/80' }];
  }

  @Get('event/:eventSlug/contestant/:contestantSlug/sponsors')
  contestantSponsors(@Param('contestantSlug') contestantSlug: string) {
    return [{ id: `sp-${contestantSlug}-1`, name: 'Swift Scale Media', logo_url: 'https://picsum.photos/210/80' }];
  }

  @Post('sponsor-impression')
  sponsorImpression() {
    return { success: true };
  }

  @Post('sponsor-click')
  sponsorClick() {
    return { success: true };
  }
}
