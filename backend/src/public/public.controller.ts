import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { OptionalJwtGuard } from '@/auth/guards/optional-jwt.guard';
import { EventsService } from '@/events/events.service';
import { ContestantsService } from '@/contestants/contestants.service';
import { LeaderboardService } from '@/leaderboard/leaderboard.service';
import { EventStatus } from '@/entities/event.entity';
import { SponsorsService } from '@/sponsors/sponsors.service';
import { CategoriesService } from '@/categories/categories.service';
import { VoterService } from '@/voter/voter.service';

/**
 * Public controller for slug-based API routes called by the frontend.
 *
 * All routes under /public/event/:slug match the frontend lib/api.ts calls:
 *   GET /public/active-event
 *   GET /public/event-summary/:eventId
 *   GET /public/event/:slug
 *   GET /public/event/:slug/stats
 *   GET /public/event/:slug/categories
 *   GET /public/event/:slug/contestants
 *   GET /public/event/:slug/leaderboard
 *   GET /public/event/:slug/faq
 *   GET /public/event/:slug/vote-packages
 *   GET /public/featured-contestants/:eventId
 *   GET /public/event/:eventSlug/contestant/:contestantSlug
 *   GET /public/event/:eventSlug/contestant/:contestantSlug/stats
 *   GET /public/event/:eventSlug/contestant/:contestantSlug/geographic-support
 *   GET /public/event/:eventSlug/contestant/:contestantSlug/related
 */
/**
 * Rate-limited public controller: 60 requests per minute per IP for general browsing.
 * Active-event and leaderboard endpoints are further restricted to 30/min
 * since they trigger heavy DB aggregations.
 */
@Controller('public')
@UseGuards(OptionalJwtGuard, ThrottlerGuard)
@Throttle({ medium: { limit: 60, ttl: 60000 } })
export class PublicController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly contestantsService: ContestantsService,
    private readonly leaderboardService: LeaderboardService,
    private readonly sponsorsService: SponsorsService,
    private readonly categoriesService: CategoriesService,
    private readonly voterService: VoterService,
  ) {}

  /**
   * GET /public/active-event
   * Returns the currently ACTIVE event (used by homepage and context)
   */
  @Get('active-event')
  @Throttle({ medium: { limit: 30, ttl: 60000 } })
  async getActiveEvent() {
    const event = await this.eventsService.getActiveEvent();
    if (!event) {
      return {
        statusCode: 200,
        message: 'No active event found',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
    return {
      statusCode: 200,
      message: 'Active event retrieved successfully',
      data: event,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event-summary/:eventId
   * Returns aggregate summary stats for an event
   */
  @Get('event-summary/:eventId')
  async getEventSummary(@Param('eventId') eventId: string) {
    const id = parseInt(eventId, 10);
    const summary = await this.eventsService.getEventSummary(id);
    return {
      statusCode: 200,
      message: 'Event summary retrieved successfully',
      data: summary,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/featured-contestants/:eventId
   * Returns featured (is_featured=true) contestants for an event
   */
  @Get('featured-contestants/:eventId')
  async getFeaturedContestants(
    @Param('eventId') eventId: string,
    @Query('limit') limit?: string,
  ) {
    const id = parseInt(eventId, 10);
    const lim = limit ? parseInt(limit, 10) : 6;
    const data = await this.contestantsService.getFeaturedContestants(id, lim);
    return {
      statusCode: 200,
      message: 'Featured contestants retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:slug
   * Returns event details by slug
   */
  @Get('event/:slug')
  async getEventBySlug(@Param('slug') slug: string) {
    const event = await this.eventsService.getEventBySlug(slug);
    return {
      statusCode: 200,
      message: 'Event retrieved successfully',
      data: event,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:slug/stats
   * Returns aggregate stats for an event (total votes, revenue, etc.)
   */
  @Get('event/:slug/stats')
  async getEventStats(@Param('slug') slug: string) {
    const event = await this.eventsService.getEventBySlug(slug);
    const stats = await this.eventsService.getEventSummary(event.id);
    return {
      statusCode: 200,
      message: 'Event statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:slug/categories
   * Returns all categories for an event by slug
   */
  @Get('event/:slug/categories')
  async getEventCategories(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const event = await this.eventsService.getEventBySlug(slug);
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const result = await this.eventsService.getCategoriesByEvent(
      event.id,
      parsedPage,
      parsedLimit,
    );
    return {
      statusCode: 200,
      message: 'Event categories retrieved successfully',
      data: result.data,
      pagination: {
        page: result.page,
        limit: parsedLimit,
        total: result.total,
        pages: result.pages,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:slug/contestants
   * Returns all approved contestants for an event by slug
   */
  @Get('event/:slug/contestants')
  async getEventContestants(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const event = await this.eventsService.getEventBySlug(slug);
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    const result = await this.contestantsService.getContestantsByEvent(
      event.id,
      parsedPage,
      parsedLimit,
    );
    return {
      statusCode: 200,
      message: 'Event contestants retrieved successfully',
      data: result.data,
      pagination: {
        page: result.page,
        limit: parsedLimit,
        total: result.total,
        pages: result.pages,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:slug/leaderboard
   * Returns leaderboard for an event by slug
   */
  @Get('event/:slug/leaderboard')
  @Throttle({ medium: { limit: 30, ttl: 60000 } })
  async getEventLeaderboard(
    @Param('slug') slug: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const event = await this.eventsService.getEventBySlug(slug);
    const lim = limit ? parseInt(limit, 10) : 100;
    const catId = categoryId ? parseInt(categoryId, 10) : undefined;
    const data = await this.leaderboardService.getLeaderboard(event.id, catId, lim);
    return {
      statusCode: 200,
      message: 'Leaderboard retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:slug/faq
   * Returns FAQ list for an event (derived from event rules)
   */
  @Get('event/:slug/faq')
  async getEventFaq(@Param('slug') slug: string) {
    // We need the raw event entity to pass to getEventFaq — use internal repo via service
    const eventDto = await this.eventsService.getEventBySlug(slug);
    // Build a minimal EventEntity-like object from the DTO for FAQ generation
    const faq = this.eventsService.getEventFaq({
      max_votes_per_user: null,
      rules: eventDto.voting_rules ?? null,
      voting_end: eventDto.voting_end ?? null,
    } as any);
    return {
      statusCode: 200,
      message: 'FAQ retrieved successfully',
      data: faq,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:slug/vote-packages
   * Returns vote packages for an event (tiered pricing)
   */
  @Get('event/:slug/vote-packages')
  async getEventVotePackages(@Param('slug') slug: string) {
    const event = await this.eventsService.getEventBySlug(slug);
    // Return configured packages or derive defaults from vote_price
    const packages = event.vote_packages ?? this.buildDefaultPackages(event.vote_price);
    return {
      statusCode: 200,
      message: 'Vote packages retrieved successfully',
      data: packages,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:slug/sponsors
   * Returns active sponsors linked to the event.
   */
  @Get('event/:slug/sponsors')
  async getEventSponsors(@Param('slug') slug: string) {
    const sponsors = await this.sponsorsService.listPublicEventSponsorsBySlug(slug);
    return {
      statusCode: 200,
      message: 'Event sponsors retrieved successfully',
      data: sponsors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/vote-eligibility/:eventId/:contestantId
   * Returns voting eligibility fields used by frontend checkout/vote flow.
   */
  @Get('vote-eligibility/:eventId/:contestantId')
  async getVoteEligibility(
    @Param('eventId') eventId: string,
    @Param('contestantId') contestantId: string,
    @Req() req?: any,
  ) {
    const data = await this.voterService.getVoteEligibility(
      req?.user?.id ? Number(req.user.id) : undefined,
      Number(eventId),
      Number(contestantId),
    );
    return {
      statusCode: 200,
      message: 'Vote eligibility retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/category-info/:categoryId
   * Returns category metadata for legacy public category page.
   */
  @Get('category-info/:categoryId')
  async getCategoryInfo(@Param('categoryId') categoryId: string) {
    const id = parseInt(categoryId, 10);
    if (!Number.isFinite(id) || id <= 0) {
      throw new NotFoundException('Category not found');
    }

    const category = await this.categoriesService.getCategoryById(id);
    return {
      statusCode: 200,
      message: 'Category info retrieved successfully',
      data: {
        id: category.id,
        name: category.name,
        description: category.description ?? '',
        slug: category.slug ?? null,
        event_id: category.event_id,
        contestant_count: Array.isArray(category.contestants) ? category.contestants.length : 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/category-contestants/:categoryId
   * Returns public contestants list for a category with sort/filter pagination.
   */
  @Get('category-contestants/:categoryId')
  async getCategoryContestants(
    @Param('categoryId') categoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('country') country?: string,
  ) {
    const id = parseInt(categoryId, 10);
    if (!Number.isFinite(id) || id <= 0) {
      throw new NotFoundException('Category not found');
    }

    const parsedPage = Math.max(1, Number.parseInt(page ?? '1', 10) || 1);
    const parsedLimit = Math.max(1, Number.parseInt(limit ?? '20', 10) || 20);
    const parsedSort =
      sort === 'alphabetical' || sort === 'recent' || sort === 'total_votes'
        ? sort
        : 'total_votes';

    const result = await this.contestantsService.getPublicContestantsByCategory(
      id,
      parsedPage,
      parsedLimit,
      parsedSort,
      country,
    );

    return {
      statusCode: 200,
      message: 'Category contestants retrieved successfully',
      data: {
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        total_pages: result.pages,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:eventSlug/contestant/:contestantSlug
   * Returns full contestant profile by event + contestant slugs
   */
  @Get('event/:eventSlug/contestant/:contestantSlug')
  async getContestantBySlug(
    @Param('eventSlug') eventSlug: string,
    @Param('contestantSlug') contestantSlug: string,
  ) {
    const contestant = await this.contestantsService.getContestantBySlug(eventSlug, contestantSlug);
    return {
      statusCode: 200,
      message: 'Contestant retrieved successfully',
      data: contestant,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:eventSlug/contestant/:contestantSlug/stats
   * Returns voting statistics for a contestant
   */
  @Get('event/:eventSlug/contestant/:contestantSlug/stats')
  async getContestantStats(
    @Param('eventSlug') eventSlug: string,
    @Param('contestantSlug') contestantSlug: string,
  ) {
    const contestant = await this.contestantsService.getContestantBySlug(eventSlug, contestantSlug);
    const stats = await this.contestantsService.getContestantStats(contestant.id);
    return {
      statusCode: 200,
      message: 'Contestant statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:eventSlug/contestant/:contestantSlug/geographic-support
   * Returns geographic vote distribution for a contestant
   */
  @Get('event/:eventSlug/contestant/:contestantSlug/geographic-support')
  async getGeographicSupport(
    @Param('eventSlug') eventSlug: string,
    @Param('contestantSlug') contestantSlug: string,
  ) {
    const data = await this.contestantsService.getGeographicSupport(eventSlug, contestantSlug);
    return {
      statusCode: 200,
      message: 'Geographic support data retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:eventSlug/contestant/:contestantSlug/related
   * Returns related contestants (same category)
   */
  @Get('event/:eventSlug/contestant/:contestantSlug/related')
  async getRelatedContestants(
    @Param('eventSlug') eventSlug: string,
    @Param('contestantSlug') contestantSlug: string,
    @Query('limit') limit?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 4;
    const data = await this.contestantsService.getRelatedContestants(eventSlug, contestantSlug, lim);
    return {
      statusCode: 200,
      message: 'Related contestants retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /public/event/:eventSlug/contestant/:contestantSlug/sponsors
   * Returns active sponsors currently running campaigns for a contestant.
   */
  @Get('event/:eventSlug/contestant/:contestantSlug/sponsors')
  async getContestantSponsors(
    @Param('eventSlug') eventSlug: string,
    @Param('contestantSlug') contestantSlug: string,
  ) {
    const sponsors = await this.sponsorsService.listPublicContestantSponsorsBySlugs(
      eventSlug,
      contestantSlug,
    );

    return {
      statusCode: 200,
      message: 'Contestant sponsors retrieved successfully',
      data: sponsors,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * POST /public/sponsor-impression
   * Lightweight tracking endpoint kept intentionally non-blocking for frontend flows.
   */
  @Post('sponsor-impression')
  async trackSponsorImpression(
    @Body()
    payload: {
      sponsorId?: string;
      placementId?: string;
      sourcePage?: string;
      eventSlug?: string;
      contestantSlug?: string;
    },
    @Req() req?: any,
  ) {
    const tracked = await this.sponsorsService.trackPublicSponsorImpression({
      ...payload,
      ipAddress: req?.ip ? String(req.ip) : undefined,
      userAgent: req?.headers?.['user-agent']
        ? String(req.headers['user-agent'])
        : undefined,
    });

    return {
      statusCode: 201,
      message: 'Sponsor impression tracked',
      data: {
        accepted: true,
        id: tracked.id,
        sponsorId: payload?.sponsorId ?? null,
        placementId: payload?.placementId ?? null,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * POST /public/sponsor-click
   * Lightweight tracking endpoint kept intentionally non-blocking for frontend flows.
   */
  @Post('sponsor-click')
  async trackSponsorClick(
    @Body()
    payload: {
      sponsorId?: string;
      placementId?: string;
      sourcePage?: string;
      eventSlug?: string;
      contestantSlug?: string;
      targetUrl?: string;
    },
    @Req() req?: any,
  ) {
    const tracked = await this.sponsorsService.trackPublicSponsorClick({
      ...payload,
      ipAddress: req?.ip ? String(req.ip) : undefined,
      userAgent: req?.headers?.['user-agent']
        ? String(req.headers['user-agent'])
        : undefined,
    });

    return {
      statusCode: 201,
      message: 'Sponsor click tracked',
      data: {
        accepted: true,
        id: tracked.id,
        sponsorId: payload?.sponsorId ?? null,
        placementId: payload?.placementId ?? null,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Helper: Build default vote packages from a base price per vote
   */
  private buildDefaultPackages(
    votePrice?: number,
  ): { votes: number; price: number; label: string }[] {
    const base = votePrice ? Number(votePrice) : 0.1;
    return [
      { votes: 10, price: Math.round(base * 10 * 100) / 100, label: '10 Votes' },
      { votes: 20, price: Math.round(base * 20 * 100) / 100, label: '20 Votes' },
      { votes: 50, price: Math.round(base * 50 * 100) / 100, label: '50 Votes' },
      { votes: 100, price: Math.round(base * 100 * 100) / 100, label: '100 Votes' },
    ];
  }
}
