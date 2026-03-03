import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Repository } from 'typeorm';
import { ContestantEntity } from '@/entities/contestant.entity';
import { VoteEntity, VoteStatus, VoteType } from '@/entities/vote.entity';
import { EventEntity } from '@/entities/event.entity';
import { CategoryEntity } from '@/entities/category.entity';

export interface RankedContestant {
  id: number;
  contestantId?: number;
  name: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  categoryName?: string;
  country?: string;
  verified?: boolean;
  votes: number;
  totalVotes: number;
  paidVotes: number;
  freeVotes: number;
  revenue: number;
  totalRevenue: number;
  rank: number;
  votePercentage?: number;
  last24hChange?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface CategoryStats {
  categoryId: number;
  categoryName: string;
  totalVotes: number;
  totalRevenue: number;
  topContestant: RankedContestant;
  leaderboard: RankedContestant[];
}

export interface EventStats {
  eventId: number;
  eventName: string;
  totalVotes: number;
  totalRevenue: number;
  categories: CategoryStats[];
  topContestants: RankedContestant[];
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);
  private readonly cacheTTLSeconds = 300; // 5 minutes

  constructor(
    @InjectRepository(ContestantEntity)
    private contestantRepository: Repository<ContestantEntity>,
    @InjectRepository(VoteEntity)
    private votesRepository: Repository<VoteEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  /**
   * Get leaderboard for a specific event and category (with caching)
   * If eventId or categoryId is not provided, returns global leaderboard
   */
  async getLeaderboard(
    eventId?: number,
    categoryId?: number,
    limit: number = 100,
    tenantId?: number,
  ): Promise<RankedContestant[]> {
    // Validate event belongs to tenant
    if (tenantId !== undefined && eventId !== undefined) {
      const event = await this.eventRepository.findOne({
        where: { id: eventId, tenant_id: tenantId },
        select: ['id'],
      });
      if (!event) {
        return [];
      }
    }

    const cacheKey = `leaderboard:${eventId ?? 'all'}:${categoryId ?? 'all'}:${tenantId ?? 'all'}`;

    // Check Redis cache
    const cached = await this.getCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    const leaderboard = await this.queryLeaderboard(eventId, categoryId, limit, tenantId);

    // Cache result in Redis
    await this.setCache(cacheKey, leaderboard);

    return leaderboard;
  }

  /**
   * Get statistics for a specific contestant
   */
  async getContestantStats(contestantId: number): Promise<{
    id: number;
    name: string;
    totalVotes: number;
    freeVotes: number;
    paidVotes: number;
    totalRevenue: number;
    validVotes: number;
    fraudSuspectedVotes: number;
    voteBreakdown: {
      valid: number;
      fraudSuspected: number;
      invalid: number;
    };
  }> {
    const contestant = await this.contestantRepository.findOne({
      where: { id: contestantId },
    });

    if (!contestant) {
      throw new Error(`Contestant ${contestantId} not found`);
    }

    // Get vote statistics
    const votes = await this.votesRepository.find({
      where: { contestant_id: contestantId },
    });

    const freeVotes = votes.filter((v) => v.vote_type === VoteType.FREE).length;
    const paidVotes = votes.filter((v) => v.vote_type === VoteType.PAID).length;
    const validVotes = votes.filter((v) => v.status === VoteStatus.VALID).length;
    const fraudSuspectedVotes = votes.filter(
      (v) => v.status === VoteStatus.FRAUD_SUSPECTED,
    ).length;
    const invalidVotes = votes.filter(
      (v) => v.status === VoteStatus.INVALID,
    ).length;

    return {
      id: contestant.id,
      name: `${contestant.first_name} ${contestant.last_name}`,
      totalVotes: votes.length,
      freeVotes,
      paidVotes,
      totalRevenue: contestant.total_revenue || 0,
      validVotes,
      fraudSuspectedVotes,
      voteBreakdown: {
        valid: validVotes,
        fraudSuspected: fraudSuspectedVotes,
        invalid: invalidVotes,
      },
    };
  }

  /**
   * Get category-wide statistics
   */
  async getCategoryStats(categoryId: number, tenantId?: number): Promise<CategoryStats> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error(`Category ${categoryId} not found`);
    }

    const leaderboard = await this.queryLeaderboard(undefined, categoryId, 100, tenantId);
    const totalVotes = leaderboard.reduce((sum, c) => sum + c.votes, 0);
    const totalRevenue = leaderboard.reduce((sum, c) => sum + c.revenue, 0);

    return {
      categoryId: category.id,
      categoryName: category.name,
      totalVotes,
      totalRevenue,
      topContestant: leaderboard[0] || null,
      leaderboard,
    };
  }

  /**
   * Get leaderboard by category (tenant-scoped)
   */
  async getLeaderboardByCategory(categoryId: number, tenantId?: number): Promise<RankedContestant[]> {
    return this.queryLeaderboard(undefined, categoryId, 100, tenantId);
  }

  /**
   * Get leaderboard statistics (tenant-scoped)
   */
  async getLeaderboardStats(eventId?: number, tenantId?: number): Promise<any> {
    const queryBuilder = this.contestantRepository.createQueryBuilder('contestant');
    
    if (eventId) {
      queryBuilder.where('contestant.event_id = :eventId', { eventId });
    }
    
    // Apply tenant scoping if provided
    if (tenantId !== undefined) {
      queryBuilder
        .innerJoin('contestant.event', 'event')
        .andWhere('event.tenant_id = :tenantId', { tenantId });
    }
    
    const totalContestants = await queryBuilder.getCount();
    
    // Count votes with tenant scoping
    const votesQueryBuilder = this.votesRepository.createQueryBuilder('vote');
    if (eventId) {
      votesQueryBuilder.where('vote.event_id = :eventId', { eventId });
    }
    if (tenantId !== undefined) {
      votesQueryBuilder
        .innerJoin('vote.event', 'event')
        .andWhere('event.tenant_id = :tenantId', { tenantId });
    }
    const totalVotes = await votesQueryBuilder.getCount();
    
    return {
      totalContestants,
      totalVotes,
      eventId,
      tenantId,
    };
  }

  /**
   * Get vote trends (tenant-scoped)
   */
  async getVoteTrends(eventId: number, tenantId?: number): Promise<any[]> {
    const queryBuilder = this.votesRepository
      .createQueryBuilder('vote')
      .select('DATE(vote.created_at)', 'date')
      .addSelect('COUNT(*)', 'votes')
      .where('vote.event_id = :eventId', { eventId })
      .andWhere('vote.status = :status', { status: VoteStatus.VALID });
    
    // Apply tenant scoping if provided
    if (tenantId !== undefined) {
      queryBuilder
        .innerJoin('vote.event', 'event')
        .andWhere('event.tenant_id = :tenantId', { tenantId });
    }
    
    return queryBuilder
      .groupBy('DATE(vote.created_at)')
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();
  }

  /**
   * Get event-wide statistics across all categories
   */
  async getEventStats(eventId: number): Promise<EventStats> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    // Get all categories for this event
    const categories = await this.categoryRepository.find({
      where: { event_id: eventId },
    });

    // Get stats for each category
    const categoryStats: CategoryStats[] = await Promise.all(
      categories.map((cat) => this.getCategoryStats(cat.id)),
    );

    // Calculate aggregates
    const totalVotes = categoryStats.reduce((sum, c) => sum + c.totalVotes, 0);
    const totalRevenue = categoryStats.reduce((sum, c) => sum + c.totalRevenue, 0);

    // Get top contestants across all categories
    const allContestants: RankedContestant[] = categoryStats.reduce<RankedContestant[]>(
      (acc, cat) => [...acc, ...cat.leaderboard],
      [] as RankedContestant[],
    );
    const topContestants = allContestants
      .sort((a: RankedContestant, b: RankedContestant) => b.votes - a.votes)
      .slice(0, 20);

    return {
      eventId: event.id,
      eventName: event.name,
      totalVotes,
      totalRevenue,
      categories: categoryStats,
      topContestants,
    };
  }

  /**
   * Private method: Query and rank contestants for a category (tenant-scoped)
   * Returns enriched data matching the frontend leaderboard mock fields
   */
  private async queryLeaderboard(
    eventId: number | undefined,
    categoryId: number | undefined,
    limit: number,
    tenantId?: number,
  ): Promise<RankedContestant[]> {
    const queryBuilder = this.contestantRepository.createQueryBuilder('contestant')
      .leftJoinAndSelect('contestant.category', 'category');

    if (categoryId !== undefined) {
      queryBuilder.where('contestant.category_id = :categoryId', { categoryId });
    }

    if (eventId !== undefined) {
      if (queryBuilder.expressionMap.wheres.length === 0) {
        queryBuilder.where('contestant.event_id = :eventId', { eventId });
      } else {
        queryBuilder.andWhere('contestant.event_id = :eventId', { eventId });
      }
    }

    // Apply tenant scoping if provided
    if (tenantId !== undefined) {
      queryBuilder
        .innerJoin('contestant.event', 'event_scope')
        .andWhere('event_scope.tenant_id = :tenantId', { tenantId });
    }

    const contestants = await queryBuilder.getMany();

    // Compute total votes across all contestants for votePercentage
    const categoryTotalVotes = contestants.reduce((sum, c) => sum + (c.vote_count || 0), 0);

    // Compute 24h windows for trend mapping
    const now = new Date();
    const last24Boundary = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const prev24Boundary = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Get votes for each contestant (enriched with all frontend mock fields)
    const leaderboard: RankedContestant[] = await Promise.all(
      contestants.map(async (contestant) => {
        const allVotes = await this.votesRepository.find({
          where: { contestant_id: contestant.id, status: VoteStatus.VALID },
        });

        const paidVotes = allVotes.filter(
          (v) => v.vote_type === VoteType.PAID,
        ).length;
        const freeVotes = allVotes.filter(
          (v) => v.vote_type === VoteType.FREE,
        ).length;

        const last24hVotes = allVotes.filter((v) => {
          const createdAt = new Date(v.created_at);
          return createdAt >= last24Boundary;
        }).length;
        const prev24hVotes = allVotes.filter((v) => {
          const createdAt = new Date(v.created_at);
          return createdAt >= prev24Boundary && createdAt < last24Boundary;
        }).length;
        const change = last24hVotes - prev24hVotes;
        const trend: 'up' | 'down' | 'neutral' =
          change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

        const totalVotesCount = allVotes.length;
        const votePercentage = categoryTotalVotes > 0
          ? Math.round((totalVotesCount / categoryTotalVotes) * 10000) / 100
          : 0;

        const isVerified = contestant.verification_status === 'verified';

        return {
          id: contestant.id,
          contestantId: contestant.id,
          name: `${contestant.first_name} ${contestant.last_name}`,
          firstName: contestant.first_name,
          lastName: contestant.last_name,
          profileImageUrl: contestant.profile_image_url || undefined,
          categoryName: contestant.category?.name,
          country: contestant.country || undefined,
          verified: isVerified,
          votes: totalVotesCount,
          totalVotes: totalVotesCount,
          paidVotes,
          freeVotes,
          revenue: contestant.total_revenue || 0,
          totalRevenue: contestant.total_revenue || 0,
          votePercentage,
          last24hChange: change,
          trend,
          rank: 0, // Will be set after sorting
        };
      }),
    );

    // Sort by vote count (descending)
    leaderboard.sort((a: RankedContestant, b: RankedContestant) => b.votes - a.votes);

    // Assign ranks
    let currentRank = 1;
    let previousVotes = -1;
    leaderboard.forEach((contestant, index) => {
      if (contestant.votes !== previousVotes) {
        currentRank = index + 1;
        previousVotes = contestant.votes;
      }
      contestant.rank = currentRank;
    });

    return leaderboard.slice(0, limit);
  }

  /**
   * Helper: Get from Redis cache
   */
  private async getCache(key: string): Promise<any | null> {
    try {
      const raw = await this.redis.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Helper: Set Redis cache with TTL
   */
  private async setCache(key: string, value: any): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', this.cacheTTLSeconds);
    } catch (error) {
      this.logger.warn(`Redis cache set failed for ${key}: ${(error as Error).message}`);
    }
  }

  /**
   * Helper: Clear all leaderboard caches
   */
  public async clearCache(): Promise<void> {
    try {
      const keys = await this.redis.keys('leaderboard:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.warn(`Redis cache clear failed: ${(error as Error).message}`);
    }
  }

  /**
   * Helper: Invalidate specific cache key
   */
  public async invalidateCache(eventId: number, categoryId: number): Promise<void> {
    try {
      const pattern = `leaderboard:${eventId}:${categoryId}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.warn(`Redis cache invalidation failed: ${(error as Error).message}`);
    }
  }
}
