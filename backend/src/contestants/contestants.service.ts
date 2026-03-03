import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContestantEntity, ContestantStatus, VerificationStatus } from '@/entities/contestant.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { EventEntity } from '@/entities/event.entity';
import { VoteEntity, VoteStatus, VoteType } from '@/entities/vote.entity';
import { CampaignEntity, CampaignStatus } from '@/entities/campaign.entity';
import { EnforcementEntityType, EnforcementLogEntity } from '@/entities/enforcement-log.entity';
import {
  CreateContestantDto,
  UpdateContestantDto,
  ContestantResponseDto,
  ContestantStatsDto,
} from './dto/contestant.dto';

@Injectable()
export class ContestantsService {
  constructor(
    @InjectRepository(ContestantEntity)
    private contestantsRepository: Repository<ContestantEntity>,
    @InjectRepository(CategoryEntity)
    private categoriesRepository: Repository<CategoryEntity>,
    @InjectRepository(EventEntity)
    private eventsRepository: Repository<EventEntity>,
    @InjectRepository(VoteEntity)
    private votesRepository: Repository<VoteEntity>,
    @InjectRepository(CampaignEntity)
    private campaignsRepository: Repository<CampaignEntity>,
    @InjectRepository(EnforcementLogEntity)
    private enforcementLogsRepository: Repository<EnforcementLogEntity>,
  ) {}

  /**
   * Get all contestants with pagination
   */
  async getAllContestants(
    page: number = 1,
    limit: number = 50,
    status?: ContestantStatus,
    tenantId?: number,
  ): Promise<{ data: ContestantResponseDto[]; total: number; page: number; pages: number }> {
    const query = this.contestantsRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.votes', 'votes')
      .leftJoinAndSelect('c.payments', 'payments')
      .leftJoinAndSelect('c.media', 'media')
      .leftJoinAndSelect('c.event', 'event')
      .leftJoinAndSelect('c.category', 'category');

    if (tenantId !== undefined) {
      query.andWhere('event.tenant_id = :tenantId', { tenantId });
    }

    if (status) {
      query.andWhere('c.status = :status', { status });
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit).orderBy('c.vote_count', 'DESC');

    const [contestants, total] = await query.getManyAndCount();
    const pages = Math.ceil(total / limit);

    return {
      data: contestants.map((c) => this.toResponseDto(c)),
      total,
      page,
      pages,
    };
  }

  /**
   * Create a new contestant
   */
  async createContestant(createContestantDto: CreateContestantDto, tenantId?: number): Promise<ContestantResponseDto> {
    // Verify event and category exist (with tenant scope)
    const eventWhere: any = { id: createContestantDto.event_id };
    if (tenantId !== undefined) eventWhere.tenant_id = tenantId;

    const event = await this.eventsRepository.findOne({ where: eventWhere });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: createContestantDto.category_id, event_id: createContestantDto.event_id },
    });

    if (!category) {
      throw new NotFoundException('Category not found in this event');
    }

    const fullName = `${createContestantDto.first_name} ${createContestantDto.last_name}`;
    const slug = `${this.slugify(fullName)}-${Date.now().toString(36)}`;

    const contestant = this.contestantsRepository.create({
      event_id: createContestantDto.event_id,
      category_id: createContestantDto.category_id,
      first_name: createContestantDto.first_name,
      last_name: createContestantDto.last_name,
      slug,
      tagline: createContestantDto.tagline,
      country: createContestantDto.country,
      biography: createContestantDto.biography,
      profile_image_url: createContestantDto.profile_image_url,
      email: createContestantDto.email,
      phone: createContestantDto.phone,
      social_media_handles: createContestantDto.social_media_handles,
      status: ContestantStatus.DRAFT,
      verification_status: VerificationStatus.UNVERIFIED,
      vote_count: 0,
      paid_vote_count: 0,
      free_vote_count: 0,
      total_revenue: 0,
    });

    const savedContestant = await this.contestantsRepository.save(contestant);
    return this.toResponseDto(savedContestant);
  }

  /**
   * Get contestant by ID
   */
  async getContestantById(id: number, tenantId?: number): Promise<ContestantResponseDto> {
    const contestant = await this.contestantsRepository.findOne({
      where: { id },
      relations: ['votes', 'payments', 'media', 'event', 'category', 'user'],
    });

    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    if (tenantId !== undefined && contestant.event?.tenant_id !== tenantId) {
      throw new NotFoundException('Contestant not found');
    }

    return this.enrichContestantResponse(this.toResponseDto(contestant));
  }

  /**
   * Get contestants by category with pagination
   */
  async getContestantsByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 50,
    status?: ContestantStatus,
    tenantId?: number,
  ): Promise<{ data: ContestantResponseDto[]; total: number; page: number; pages: number }> {
    const query = this.contestantsRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.votes', 'votes')
      .leftJoinAndSelect('c.payments', 'payments')
      .leftJoinAndSelect('c.media', 'media')
      .where('c.category_id = :categoryId', { categoryId });

    if (tenantId !== undefined) {
      query.innerJoin('c.event', 'event_scope')
        .andWhere('event_scope.tenant_id = :tenantId', { tenantId });
    }

    if (status) {
      query.andWhere('c.status = :status', { status });
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit).orderBy('c.vote_count', 'DESC');

    const [contestants, total] = await query.getManyAndCount();
    const pages = Math.ceil(total / limit);

    return {
      data: contestants.map((c) => this.toResponseDto(c)),
      total,
      page,
      pages,
    };
  }

  /**
   * Public contestants list by category with sorting and country filter.
   * Used by /public/category-contestants/:categoryId.
   */
  async getPublicContestantsByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 20,
    sort: 'total_votes' | 'alphabetical' | 'recent' = 'total_votes',
    country?: string,
  ): Promise<{ data: ContestantResponseDto[]; total: number; page: number; pages: number; limit: number }> {
    const query = this.contestantsRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.event', 'event')
      .leftJoinAndSelect('c.category', 'category')
      .leftJoinAndSelect('c.media', 'media')
      .where('c.category_id = :categoryId', { categoryId })
      .andWhere('c.status = :status', { status: ContestantStatus.APPROVED });

    if (country) {
      query.andWhere('LOWER(c.country) = LOWER(:country)', { country });
    }

    if (sort === 'alphabetical') {
      query.orderBy('c.first_name', 'ASC').addOrderBy('c.last_name', 'ASC');
    } else if (sort === 'recent') {
      query.orderBy('c.created_at', 'DESC');
    } else {
      query.orderBy('c.vote_count', 'DESC');
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [contestants, total] = await query.getManyAndCount();
    const pages = Math.ceil(total / limit);

    return {
      data: contestants.map((c) => this.toResponseDto(c)),
      total,
      page,
      pages,
      limit,
    };
  }

  /**
   * Get contestants by event with pagination
   */
  async getContestantsByEvent(
    eventId: number,
    page: number = 1,
    limit: number = 100,
    tenantId?: number,
  ): Promise<{ data: ContestantResponseDto[]; total: number; page: number; pages: number }> {
    if (tenantId !== undefined) {
      const event = await this.eventsRepository.findOne({
        where: { id: eventId, tenant_id: tenantId },
        select: ['id'],
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
    }

    const query = this.contestantsRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.votes', 'votes')
      .leftJoinAndSelect('c.payments', 'payments')
      .leftJoinAndSelect('c.media', 'media')
      .where('c.event_id = :eventId', { eventId });

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit).orderBy('c.vote_count', 'DESC');

    const [contestants, total] = await query.getManyAndCount();
    const pages = Math.ceil(total / limit);

    return {
      data: contestants.map((c) => this.toResponseDto(c)),
      total,
      page,
      pages,
    };
  }

  /**
   * Update contestant
   */
  async updateContestant(id: number, updateContestantDto: UpdateContestantDto, tenantId?: number): Promise<ContestantResponseDto> {
    const contestant = await this.contestantsRepository.findOne({
      where: { id },
      relations: ['votes', 'payments', 'media', 'event', 'category'],
    });

    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    if (tenantId !== undefined && contestant.event?.tenant_id !== tenantId) {
      throw new NotFoundException('Contestant not found');
    }

    if (updateContestantDto.social_media_handles) {
      const hasActiveCampaign = await this.campaignsRepository.count({
        where: {
          contestant_id: id,
          campaign_status: CampaignStatus.ACTIVE,
        },
      });

      if (hasActiveCampaign > 0) {
        await this.enforcementLogsRepository.save(
          this.enforcementLogsRepository.create({
            entity_type: EnforcementEntityType.CONTESTANT,
            entity_id: id,
            violation_type: 'social_lock_violation',
            description: 'Attempted social handle change during active campaign',
            penalty_score: 5,
            action_taken: 'update_blocked',
          }),
        );

        throw new BadRequestException(
          'Social handles are locked while an active campaign exists',
        );
      }
    }

    // Update fields
    if (updateContestantDto.first_name) contestant.first_name = updateContestantDto.first_name;
    if (updateContestantDto.last_name) contestant.last_name = updateContestantDto.last_name;
    if (updateContestantDto.biography) contestant.biography = updateContestantDto.biography;
    if (updateContestantDto.profile_image_url) contestant.profile_image_url = updateContestantDto.profile_image_url;
    if (updateContestantDto.email) contestant.email = updateContestantDto.email;
    if (updateContestantDto.phone) contestant.phone = updateContestantDto.phone;
    if (updateContestantDto.tagline !== undefined) contestant.tagline = updateContestantDto.tagline;
    if (updateContestantDto.country !== undefined) contestant.country = updateContestantDto.country;
    if (updateContestantDto.social_media_handles) contestant.social_media_handles = updateContestantDto.social_media_handles;
    if (updateContestantDto.status) contestant.status = updateContestantDto.status;
    if (updateContestantDto.verification_status) contestant.verification_status = updateContestantDto.verification_status;

    contestant.updated_at = new Date();

    const updatedContestant = await this.contestantsRepository.save(contestant);
    return this.toResponseDto(updatedContestant);
  }

  /**
   * Delete contestant
   */
  async deleteContestant(id: number, tenantId?: number): Promise<void> {
    const contestant = await this.contestantsRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    if (tenantId !== undefined && contestant.event?.tenant_id !== tenantId) {
      throw new NotFoundException('Contestant not found');
    }

    await this.contestantsRepository.remove(contestant);
  }

  /**
   * Get contestant statistics
   */
  async getContestantStats(id: number, tenantId?: number): Promise<ContestantStatsDto> {
    const contestant = await this.contestantsRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    if (tenantId !== undefined && contestant.event?.tenant_id !== tenantId) {
      throw new NotFoundException('Contestant not found');
    }

    // Get valid votes only
    const validVotes = await this.votesRepository.count({
      where: {
        contestant_id: id,
        status: VoteStatus.VALID,
      },
    });

    const paidVotes = await this.votesRepository.count({
      where: {
        contestant_id: id,
        vote_type: VoteType.PAID,
        status: VoteStatus.VALID,
      },
    });

    const freeVotes = validVotes - paidVotes;

    return {
      id: contestant.id,
      name: `${contestant.first_name} ${contestant.last_name}`,
      votes: validVotes,
      paidVotes,
      freeVotes,
      revenue: contestant.total_revenue,
      rank: 0, // Will be calculated by leaderboard service
    };
  }

  /**
   * Approve contestant
   */
  async approveContestant(id: number, tenantId?: number): Promise<ContestantResponseDto> {
    const contestant = await this.contestantsRepository.findOne({
      where: { id },
      relations: ['votes', 'payments', 'media', 'event', 'category'],
    });

    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    if (tenantId !== undefined && contestant.event?.tenant_id !== tenantId) {
      throw new NotFoundException('Contestant not found');
    }

    contestant.status = ContestantStatus.APPROVED;
    contestant.updated_at = new Date();

    const updatedContestant = await this.contestantsRepository.save(contestant);
    return this.toResponseDto(updatedContestant);
  }

  /**
   * Verify contestant
   */
  async verifyContestant(id: number, tenantId?: number): Promise<ContestantResponseDto> {
    const contestant = await this.contestantsRepository.findOne({
      where: { id },
      relations: ['votes', 'payments', 'media', 'event', 'category'],
    });

    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    if (tenantId !== undefined && contestant.event?.tenant_id !== tenantId) {
      throw new NotFoundException('Contestant not found');
    }

    contestant.verification_status = VerificationStatus.VERIFIED;
    contestant.updated_at = new Date();

    const updatedContestant = await this.contestantsRepository.save(contestant);
    return this.toResponseDto(updatedContestant);
  }

  /**
   * Increment vote counts
   */
  async incrementVoteCounts(
    id: number,
    voteType: VoteType,
    amount: number = 0,
  ): Promise<void> {
    const contestant = await this.contestantsRepository.findOne({
      where: { id },
      relations: ['votes', 'payments', 'media'],
    });

    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    contestant.vote_count += 1;

    if (voteType === VoteType.PAID) {
      contestant.paid_vote_count += 1;
      contestant.total_revenue = (contestant.total_revenue || 0) + amount;
    } else {
      contestant.free_vote_count += 1;
    }

    contestant.updated_at = new Date();
    await this.contestantsRepository.save(contestant);
  }

  /**
   * Helper: Convert entity to response DTO with all fields the frontend mock expects
   */
  private toResponseDto(contestant: ContestantEntity): ContestantResponseDto {
    const fullName = `${contestant.first_name} ${contestant.last_name}`.trim();
    const isVerified = contestant.verification_status === VerificationStatus.VERIFIED;

    // Compute age from date_of_birth
    let age: number | undefined;
    if (contestant.date_of_birth) {
      const dob = new Date(contestant.date_of_birth);
      const now = new Date();
      age = now.getFullYear() - dob.getFullYear();
      const monthDiff = now.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
        age -= 1;
      }
    }

    // Extract gallery photos and video from media files
    const galleryPhotos: string[] = [];
    let videoUrl: string | undefined;
    let videoThumbnail: string | undefined;
    if (contestant.media && contestant.media.length > 0) {
      for (const m of contestant.media) {
        if (m.media_type === 'photo') {
          galleryPhotos.push(m.media_url);
        } else if (m.media_type === 'video' && !videoUrl) {
          videoUrl = m.media_url;
          videoThumbnail = m.thumbnail_url;
        }
      }
    }

    return {
      id: contestant.id,
      event_id: contestant.event_id,
      category_id: contestant.category_id,
      slug: contestant.slug,
      event_slug: contestant.event?.slug,
      event_name: contestant.event?.name,
      category_name: contestant.category?.name,
      name: fullName,
      first_name: contestant.first_name,
      last_name: contestant.last_name,
      biography: contestant.biography,
      photo_url: contestant.profile_image_url,
      profile_image_url: contestant.profile_image_url,
      email: contestant.email,
      phone: contestant.phone,
      country: contestant.country,
      tagline: contestant.tagline,
      age,
      social_media_handles: contestant.social_media_handles,
      status: contestant.status,
      verification_status: contestant.verification_status,
      is_verified: isVerified,
      vote_count: contestant.vote_count,
      paid_vote_count: contestant.paid_vote_count,
      free_vote_count: contestant.free_vote_count,
      total_votes: contestant.vote_count,
      total_paid_votes: contestant.paid_vote_count,
      total_free_votes: contestant.free_vote_count,
      votes_today: 0,
      rank: contestant.display_order || 0,
      rank_overall: contestant.display_order || 0,
      rank_in_category: contestant.display_order || 0,
      vote_percentage: 0,
      total_revenue: contestant.total_revenue,
      gallery_photos: galleryPhotos.length > 0 ? galleryPhotos : undefined,
      video_url: videoUrl,
      video_thumbnail: videoThumbnail,
      created_at: contestant.created_at,
      updated_at: contestant.updated_at,
    };
  }

  /**
   * Get contestant by event slug + contestant slug (public endpoint)
   */
  async getContestantBySlug(
    eventSlug: string,
    contestantSlug: string,
    tenantId?: number,
  ): Promise<ContestantResponseDto> {
    const query = this.contestantsRepository
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.event', 'event')
      .leftJoinAndSelect('c.category', 'category')
      .leftJoinAndSelect('c.media', 'media')
      .where('event.slug = :eventSlug', { eventSlug })
      .andWhere('c.slug = :contestantSlug', { contestantSlug });

    if (tenantId !== undefined) {
      query.andWhere('event.tenant_id = :tenantId', { tenantId });
    }

    const contestant = await query.getOne();

    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    return this.enrichContestantResponse(this.toResponseDto(contestant));
  }

  /**
   * Get today's votes count for a contestant
   */
  async getVotesToday(contestantId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.votesRepository
      .createQueryBuilder('vote')
      .where('vote.contestant_id = :contestantId', { contestantId })
      .andWhere('vote.status = :status', { status: VoteStatus.VALID })
      .andWhere('vote.created_at >= :today', { today })
      .getCount();
  }

  /**
   * Get featured contestants for an event
   */
  async getFeaturedContestants(
    eventId: number,
    limit: number = 6,
    tenantId?: number,
  ): Promise<ContestantResponseDto[]> {
    if (tenantId !== undefined) {
      const event = await this.eventsRepository.findOne({
        where: { id: eventId, tenant_id: tenantId },
        select: ['id'],
      });
      if (!event) throw new NotFoundException('Event not found');
    }

    const contestants = await this.contestantsRepository.find({
      where: { event_id: eventId, is_featured: true, status: ContestantStatus.APPROVED },
      relations: ['event', 'category', 'media'],
      order: { vote_count: 'DESC' },
      take: limit,
    });

    return contestants.map((c) => this.toResponseDto(c));
  }

  /**
   * Get related contestants (same category, excluding current)
   */
  async getRelatedContestants(
    eventSlug: string,
    contestantSlug: string,
    limit: number = 4,
    tenantId?: number,
  ): Promise<ContestantResponseDto[]> {
    // First find the target contestant to get its category
    const target = await this.getContestantBySlug(eventSlug, contestantSlug, tenantId);
    if (!target) return [];

    const query = this.contestantsRepository
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.event', 'event')
      .leftJoinAndSelect('c.category', 'category')
      .leftJoinAndSelect('c.media', 'media')
      .where('event.slug = :eventSlug', { eventSlug })
      .andWhere('c.category_id = :categoryId', { categoryId: target.category_id })
      .andWhere('c.id != :id', { id: target.id })
      .andWhere('c.status = :status', { status: ContestantStatus.APPROVED })
      .orderBy('c.vote_count', 'DESC')
      .take(limit);

    const related = await query.getMany();
    return related.map((c) => this.toResponseDto(c));
  }

  /**
   * Get geographic vote distribution for a contestant
   */
  async getGeographicSupport(
    eventSlug: string,
    contestantSlug: string,
  ): Promise<{ country: string; votes: number; percentage: number }[]> {
    // Find contestant
    const contestant = await this.contestantsRepository
      .createQueryBuilder('c')
      .innerJoin('c.event', 'event')
      .where('event.slug = :eventSlug', { eventSlug })
      .andWhere('c.slug = :contestantSlug', { contestantSlug })
      .select(['c.id'])
      .getOne();

    if (!contestant) return [];

    // Group votes by voter_country (stored on the vote entity)
    const rows = await this.votesRepository
      .createQueryBuilder('vote')
      .select('vote.voter_country', 'country')
      .addSelect('COUNT(*)', 'votes')
      .where('vote.contestant_id = :id', { id: contestant.id })
      .andWhere('vote.status = :status', { status: VoteStatus.VALID })
      .andWhere('vote.voter_country IS NOT NULL')
      .groupBy('vote.voter_country')
      .orderBy('votes', 'DESC')
      .limit(10)
      .getRawMany();

    const total = rows.reduce((sum: number, r: any) => sum + Number(r.votes), 0);

    return rows.map((r: any) => ({
      country: r.country,
      votes: Number(r.votes),
      percentage: total > 0 ? Math.round((Number(r.votes) / total) * 10000) / 100 : 0,
    }));
  }

  /**
   * Contestant dashboard analytics
   * Matches frontend dashboard-mock.ts structure:
   * DashboardOverview, RankingData, AnalyticsData, RevenueData, GeographicData
   *
   * Access: only the contestant owner (contestant.user_id === requestUserId) or an admin.
   */
  async getContestantDashboard(
    id: number,
    tenantId?: number,
    requestUserId?: number,
    requestUserRole?: string,
  ) {
    const contestant = await this.contestantsRepository.findOne({
      where: { id },
      relations: ['event', 'category'],
    });

    if (!contestant) {
      throw new NotFoundException('Contestant not found');
    }

    if (tenantId !== undefined && contestant.event?.tenant_id !== tenantId) {
      throw new NotFoundException('Contestant not found');
    }

    // Ownership check: only the linked user or an admin may view private analytics
    if (requestUserId !== undefined) {
      const isOwner = contestant.user_id === requestUserId;
      const isAdmin = requestUserRole === 'admin';
      if (!isOwner && !isAdmin) {
        throw new ForbiddenException('You do not have permission to view this dashboard');
      }
    }

    // Date boundaries
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

    const [
      todayVotes,
      weekVotes,
      totalContestantsInCategory,
      revenueThisWeek,
      revenueThisMonth,
      geographicRows,
      dailyVoteRows,
      hourlyVoteRows,
    ] = await Promise.all([
      this.votesRepository.count({
        where: { contestant_id: id, status: VoteStatus.VALID },
      }),
      this.votesRepository
        .createQueryBuilder('v')
        .where('v.contestant_id = :id', { id })
        .andWhere('v.status = :status', { status: VoteStatus.VALID })
        .andWhere('v.created_at >= :since', { since: startOfWeek })
        .getCount(),
      this.contestantsRepository.count({ where: { category_id: contestant.category_id } }),
      this.votesRepository
        .createQueryBuilder('v')
        .select('SUM(v.amount)', 'total')
        .where('v.contestant_id = :id', { id })
        .andWhere("v.vote_type = 'paid'")
        .andWhere('v.created_at >= :since', { since: startOfWeek })
        .getRawOne(),
      this.votesRepository
        .createQueryBuilder('v')
        .select('SUM(v.amount)', 'total')
        .where('v.contestant_id = :id', { id })
        .andWhere("v.vote_type = 'paid'")
        .andWhere('v.created_at >= :since', { since: startOfMonth })
        .getRawOne(),
      this.votesRepository
        .createQueryBuilder('v')
        .select('v.voter_country', 'country')
        .addSelect('COUNT(*)', 'votes')
        .where('v.contestant_id = :id', { id })
        .andWhere('v.status = :status', { status: VoteStatus.VALID })
        .andWhere('v.voter_country IS NOT NULL')
        .groupBy('v.voter_country')
        .orderBy('votes', 'DESC')
        .limit(10)
        .getRawMany(),
      this.votesRepository
        .createQueryBuilder('v')
        .select('DATE(v.created_at)', 'date')
        .addSelect('COUNT(*)', 'votes')
        .where('v.contestant_id = :id', { id })
        .andWhere('v.status = :status', { status: VoteStatus.VALID })
        .andWhere('v.created_at >= :since', { since: startOfWeek })
        .groupBy('DATE(v.created_at)')
        .orderBy('date', 'ASC')
        .getRawMany(),
      this.votesRepository
        .createQueryBuilder('v')
        .select('EXTRACT(HOUR FROM v.created_at)', 'hour')
        .addSelect('COUNT(*)', 'votes')
        .where('v.contestant_id = :id', { id })
        .andWhere('v.status = :status', { status: VoteStatus.VALID })
        .andWhere('v.created_at >= :since', { since: startOfDay })
        .groupBy('EXTRACT(HOUR FROM v.created_at)')
        .orderBy('hour', 'ASC')
        .getRawMany(),
    ]);

    // Compute rank within category
    const rankResult = await this.contestantsRepository
      .createQueryBuilder('c')
      .where('c.category_id = :categoryId', { categoryId: contestant.category_id })
      .andWhere('c.vote_count > :count', { count: contestant.vote_count })
      .getCount();
    const rankInCategory = rankResult + 1;

    const totalCategoryVotes = (await this.contestantsRepository
      .createQueryBuilder('c')
      .select('SUM(c.vote_count)', 'total')
      .where('c.category_id = :categoryId', { categoryId: contestant.category_id })
      .getRawOne())?.total ?? 0;

    const voteSharePercentage = Number(totalCategoryVotes) > 0
      ? Math.round((contestant.vote_count / Number(totalCategoryVotes)) * 10000) / 100
      : 0;

    // Build geographic data
    const geoTotal = geographicRows.reduce((sum: number, r: any) => sum + Number(r.votes), 0);
    const geographicData = geographicRows.map((r: any) => ({
      country: r.country,
      votes: Number(r.votes),
      percentage: geoTotal > 0 ? Math.round((Number(r.votes) / geoTotal) * 10000) / 100 : 0,
    }));

    return {
      dashboardOverview: {
        total_votes: contestant.vote_count,
        free_votes: contestant.free_vote_count,
        paid_votes: contestant.paid_vote_count,
        revenue_generated: Number(contestant.total_revenue ?? 0),
        daily_votes: dailyVoteRows.map((r: any) => ({
          date: r.date,
          votes: Number(r.votes),
        })),
      },
      rankingData: {
        current_rank: rankInCategory,
        total_contestants: totalContestantsInCategory,
        rank_movement: 0, // Would need historical data
        vote_share_percentage: voteSharePercentage,
      },
      analyticsData: {
        votes_this_week: weekVotes,
        votes_today: todayVotes,
        hourly_distribution: hourlyVoteRows.map((r: any) => ({
          hour: Number(r.hour),
          votes: Number(r.votes),
        })),
      },
      revenueData: {
        total_revenue: Number(contestant.total_revenue ?? 0),
        revenue_this_week: Number(revenueThisWeek?.total ?? 0),
        revenue_this_month: Number(revenueThisMonth?.total ?? 0),
      },
      geographicData,
    };
  }

  async getContestantByUserId(userId: number, tenantId?: number): Promise<ContestantResponseDto> {
    const query = this.contestantsRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.event', 'event')
      .leftJoinAndSelect('c.category', 'category')
      .leftJoinAndSelect('c.media', 'media')
      .where('c.user_id = :userId', { userId })
      .orderBy('c.updated_at', 'DESC');

    if (tenantId !== undefined) {
      query.andWhere('event.tenant_id = :tenantId', { tenantId });
    }

    const contestant = await query.getOne();
    if (!contestant) {
      throw new NotFoundException('Contestant profile not found for current user');
    }

    return this.enrichContestantResponse(this.toResponseDto(contestant));
  }

  async getContestantDashboardByUserId(
    userId: number,
    tenantId?: number,
    requestUserRole?: string,
  ) {
    const contestant = await this.getContestantByUserId(userId, tenantId);
    return this.getContestantDashboard(
      contestant.id,
      tenantId,
      userId,
      requestUserRole,
    );
  }

  private async enrichContestantResponse(
    dto: ContestantResponseDto,
  ): Promise<ContestantResponseDto> {
    const [votesToday, higherOverall, higherInCategory, categoryTotalVotes] =
      await Promise.all([
        this.getVotesToday(dto.id),
        this.contestantsRepository
          .createQueryBuilder('c')
          .where('c.vote_count > :count', { count: dto.total_votes || 0 })
          .getCount(),
        this.contestantsRepository
          .createQueryBuilder('c')
          .where('c.category_id = :categoryId', { categoryId: dto.category_id })
          .andWhere('c.vote_count > :count', { count: dto.total_votes || 0 })
          .getCount(),
        this.contestantsRepository
          .createQueryBuilder('c')
          .select('COALESCE(SUM(c.vote_count), 0)', 'total')
          .where('c.category_id = :categoryId', { categoryId: dto.category_id })
          .getRawOne(),
      ]);

    const categoryVotes = Number(categoryTotalVotes?.total || 0);
    const votePercentage =
      categoryVotes > 0
        ? Math.round(((dto.total_votes || 0) / categoryVotes) * 10000) / 100
        : 0;

    return {
      ...dto,
      votes_today: votesToday,
      rank_overall: higherOverall + 1,
      rank_in_category: higherInCategory + 1,
      rank: dto.rank || higherOverall + 1,
      vote_percentage: votePercentage,
    };
  }

  /**
   * Generates a URL-safe slug from a string.
   * Strips diacritics, non-alphanumeric chars, and collapses spaces to hyphens.
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacritics
      .replace(/[^a-z0-9\s]/g, '')     // remove non-alphanumeric
      .trim()
      .replace(/\s+/g, '-')            // spaces → hyphens
      .replace(/-+/g, '-');            // collapse consecutive hyphens
  }
}
