import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity, EventStatus } from '@/entities/event.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { TenantEntity } from '@/entities/tenant.entity';
import {
  CreateEventDto,
  UpdateEventDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  EventResponseDto,
  CategoryResponseDto,
} from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(EventEntity)
    private eventsRepository: Repository<EventEntity>,
    @InjectRepository(CategoryEntity)
    private categoriesRepository: Repository<CategoryEntity>,
    @InjectRepository(TenantEntity)
    private tenantsRepository: Repository<TenantEntity>,
  ) {}

  /**
   * Create a new event
   */
  async createEvent(
    userId: number,
    createEventDto: CreateEventDto,
    requestedTenantId?: number,
  ): Promise<EventResponseDto> {
    const tenantId = this.resolveRequestedTenantId(createEventDto.tenant_id, requestedTenantId);
    const resolvedTenantId = await this.resolveTenantId(tenantId);

    // Check if slug already exists in tenant scope.
    const existingEvent = await this.eventsRepository.findOne({
      where: { slug: createEventDto.slug, tenant_id: resolvedTenantId },
    });
    if (existingEvent) {
      throw new ConflictException('Event with this slug already exists for this tenant');
    }
    const now = new Date();
    const startDate = createEventDto.start_date ?? now;
    const endDate = createEventDto.end_date ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const votingStart = createEventDto.voting_start ?? startDate;
    const votingEnd = createEventDto.voting_end ?? endDate;
    const season = createEventDto.season ?? startDate.getUTCFullYear();

    this.validateEventDateWindow(startDate, endDate, votingStart, votingEnd);

    const event = this.eventsRepository.create({
      tenant_id: resolvedTenantId,
      name: createEventDto.name,
      slug: createEventDto.slug,
      description: createEventDto.description,
      tagline: createEventDto.tagline,
      organizer_name: createEventDto.organizer_name,
      vote_price: createEventDto.vote_price,
      max_votes_per_transaction: createEventDto.max_votes_per_transaction,
      vote_packages: createEventDto.vote_packages,
      status: createEventDto.status || EventStatus.DRAFT,
      season,
      start_date: startDate,
      end_date: endDate,
      voting_start: votingStart,
      voting_end: votingEnd,
      creator_id: userId,
      voting_rules: createEventDto.voting_rules,
      allow_write_ins: createEventDto.allow_write_ins || false,
      is_public: createEventDto.is_public || false,
    });

    const savedEvent = await this.eventsRepository.save(event);
    return this.eventToResponseDto(savedEvent);
  }

  /**
   * Get event by ID
   */
  async getEventById(id: number, tenantId?: number): Promise<EventResponseDto> {
    const event = await this.eventsRepository.findOne({
      where: this.withTenantScope({ id }, tenantId),
      relations: ['categories', 'contestants', 'votes', 'batches', 'payments', 'creator'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.eventToResponseDto(event);
  }

  /**
   * Get all events with pagination
   */
  async getAllEvents(
    page: number = 1,
    limit: number = 20,
    status?: EventStatus,
    isPublic?: boolean,
    tenantId?: number,
  ): Promise<{ data: EventResponseDto[]; total: number; page: number; pages: number }> {
    const query = this.eventsRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.categories', 'categories')
      .leftJoinAndSelect('e.contestants', 'contestants')
      .leftJoinAndSelect('e.creator', 'creator');

    if (status) {
      query.where('e.status = :status', { status });
    }

    if (isPublic !== undefined) {
      query.andWhere('e.is_public = :isPublic', { isPublic });
    }

    if (tenantId !== undefined) {
      query.andWhere('e.tenant_id = :tenantId', { tenantId });
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit).orderBy('e.created_at', 'DESC');

    const [events, total] = await query.getManyAndCount();
    const pages = Math.ceil(total / limit);

    return {
      data: events.map((e) => this.eventToResponseDto(e)),
      total,
      page,
      pages,
    };
  }

  /**
   * Update event
   */
  async updateEvent(id: number, updateEventDto: UpdateEventDto, tenantId?: number): Promise<EventResponseDto> {
    const event = await this.eventsRepository.findOne({
      where: this.withTenantScope({ id }, tenantId),
      relations: ['categories', 'contestants', 'votes', 'batches', 'creator'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Update fields
    if (updateEventDto.name) event.name = updateEventDto.name;
    if (updateEventDto.description) event.description = updateEventDto.description;
    if (updateEventDto.tagline !== undefined) event.tagline = updateEventDto.tagline;
    if (updateEventDto.organizer_name !== undefined) event.organizer_name = updateEventDto.organizer_name;
    if (updateEventDto.vote_price !== undefined) event.vote_price = updateEventDto.vote_price;
    if (updateEventDto.max_votes_per_transaction !== undefined) event.max_votes_per_transaction = updateEventDto.max_votes_per_transaction;
    if (updateEventDto.vote_packages !== undefined) event.vote_packages = updateEventDto.vote_packages;
    if (updateEventDto.start_date) event.start_date = updateEventDto.start_date;
    if (updateEventDto.end_date) event.end_date = updateEventDto.end_date;
    if (updateEventDto.voting_start) event.voting_start = updateEventDto.voting_start;
    if (updateEventDto.voting_end) event.voting_end = updateEventDto.voting_end;
    if (updateEventDto.season !== undefined) event.season = updateEventDto.season;
    if (updateEventDto.status) event.status = updateEventDto.status;
    if (updateEventDto.voting_rules) event.voting_rules = updateEventDto.voting_rules;
    if (updateEventDto.allow_write_ins !== undefined) event.allow_write_ins = updateEventDto.allow_write_ins;
    if (updateEventDto.is_public !== undefined) event.is_public = updateEventDto.is_public;

    this.validateEventDateWindow(event.start_date, event.end_date, event.voting_start, event.voting_end);
    event.updated_at = new Date();

    const updatedEvent = await this.eventsRepository.save(event);
    return this.eventToResponseDto(updatedEvent);
  }

  /**
   * Delete event (soft delete)
   */
  async deleteEvent(id: number, tenantId?: number): Promise<void> {
    const event = await this.eventsRepository.findOne({
      where: this.withTenantScope({ id }, tenantId),
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    await this.eventsRepository.remove(event);
  }

  /**
   * Get categories for an event
   */
  async getCategoriesByEvent(
    eventId: number,
    page: number = 1,
    limit: number = 50,
    tenantId?: number,
  ): Promise<{ data: CategoryResponseDto[]; total: number; page: number; pages: number }> {
    await this.ensureEventInTenant(eventId, tenantId);
    const skip = (page - 1) * limit;

    const [categories, total] = await this.categoriesRepository.findAndCount({
      where: { event_id: eventId },
      skip,
      take: limit,
      relations: ['contestants', 'votes', 'event'],
      order: { created_at: 'DESC' },
    });

    const pages = Math.ceil(total / limit);

    return {
      data: categories.map((c) => this.categoryToResponseDto(c)),
      total,
      page,
      pages,
    };
  }

  /**
   * Create category for event
   */
  async createCategory(createCategoryDto: CreateCategoryDto, tenantId?: number): Promise<CategoryResponseDto> {
    // Verify event exists
    const event = await this.eventsRepository.findOne({
      where: this.withTenantScope({ id: createCategoryDto.event_id }, tenantId),
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const slug = await this.generateUniqueCategorySlug(
      createCategoryDto.event_id,
      createCategoryDto.name,
    );

    const category = this.categoriesRepository.create({
      event_id: createCategoryDto.event_id,
      name: createCategoryDto.name,
      slug,
      description: createCategoryDto.description,
      voting_enabled: createCategoryDto.voting_enabled !== false,
      public_voting: createCategoryDto.public_voting !== false,
      paid_voting: createCategoryDto.paid_voting || false,
      minimum_vote_amount: createCategoryDto.minimum_vote_amount,
      daily_vote_limit: createCategoryDto.daily_vote_limit,
      max_votes_per_user: createCategoryDto.max_votes_per_user,
    });

    const savedCategory = await this.categoriesRepository.save(category);
    return this.categoryToResponseDto(savedCategory);
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number, tenantId?: number): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['contestants', 'votes', 'event'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    this.ensureCategoryInTenant(category, tenantId);

    return this.categoryToResponseDto(category);
  }

  /**
   * Update category
   */
  async updateCategory(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    tenantId?: number,
  ): Promise<CategoryResponseDto> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['contestants', 'votes', 'event'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    this.ensureCategoryInTenant(category, tenantId);

    // Update fields
    if (updateCategoryDto.name) {
      category.name = updateCategoryDto.name;
      category.slug = await this.generateUniqueCategorySlug(
        category.event_id,
        updateCategoryDto.name,
        category.id,
      );
    }
    if (updateCategoryDto.description) category.description = updateCategoryDto.description;
    if (updateCategoryDto.voting_enabled !== undefined) category.voting_enabled = updateCategoryDto.voting_enabled;
    if (updateCategoryDto.public_voting !== undefined) category.public_voting = updateCategoryDto.public_voting;
    if (updateCategoryDto.paid_voting !== undefined) category.paid_voting = updateCategoryDto.paid_voting;
    if (updateCategoryDto.minimum_vote_amount !== undefined) category.minimum_vote_amount = updateCategoryDto.minimum_vote_amount;
    if (updateCategoryDto.daily_vote_limit !== undefined) category.daily_vote_limit = updateCategoryDto.daily_vote_limit;
    if (updateCategoryDto.max_votes_per_user !== undefined) category.max_votes_per_user = updateCategoryDto.max_votes_per_user;

    category.updated_at = new Date();

    const updatedCategory = await this.categoriesRepository.save(category);
    return this.categoryToResponseDto(updatedCategory);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: number, tenantId?: number): Promise<void> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    this.ensureCategoryInTenant(category, tenantId);

    await this.categoriesRepository.remove(category);
  }

  /**
   * Helper: Convert EventEntity to ResponseDTO with all frontend-expected fields
   */
  private eventToResponseDto(event: EventEntity): EventResponseDto {
    const location = [event.city, event.country].filter(Boolean).join(', ') || undefined;
    return {
      id: event.id,
      tenant_id: event.tenant_id,
      name: event.name,
      slug: event.slug,
      description: event.description,
      tagline: event.tagline,
      organizer_name: event.organizer_name,
      location,
      vote_price: event.vote_price ? Number(event.vote_price) : undefined,
      max_votes_per_transaction: event.max_votes_per_transaction,
      vote_packages: event.vote_packages,
      status: event.status,
      is_live: event.status === EventStatus.ACTIVE,
      season: event.season,
      season_year: event.season,
      start_date: event.start_date,
      end_date: event.end_date,
      voting_start: event.voting_start,
      voting_end: event.voting_end,
      creator_id: event.creator_id,
      voting_rules: event.voting_rules,
      allow_write_ins: event.allow_write_ins,
      is_public: event.is_public,
      banner_url: event.banner_image_url,
      created_at: event.created_at,
      updated_at: event.updated_at,
    };
  }

  private async resolveTenantId(tenantId?: number): Promise<number> {
    if (tenantId !== undefined) {
      const tenant = await this.tenantsRepository.findOne({ where: { id: tenantId } });
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }
      return tenant.id;
    }

    const defaultTenant = await this.tenantsRepository.findOne({
      where: { slug: 'default-tenant' },
    });
    if (defaultTenant) {
      return defaultTenant.id;
    }

    const fallbackTenant = await this.tenantsRepository.findOne({
      order: { id: 'ASC' },
    });
    if (!fallbackTenant) {
      throw new BadRequestException('No tenant available. Run tenant migration first.');
    }

    return fallbackTenant.id;
  }

  private withTenantScope(where: { id: number }, tenantId?: number): { id: number; tenant_id?: number } {
    return tenantId === undefined ? where : { ...where, tenant_id: tenantId };
  }

  private resolveRequestedTenantId(bodyTenantId?: number, queryTenantId?: number): number | undefined {
    if (bodyTenantId !== undefined && queryTenantId !== undefined && bodyTenantId !== queryTenantId) {
      throw new BadRequestException('Conflicting tenant identifiers in body and query');
    }
    return bodyTenantId ?? queryTenantId;
  }

  private async ensureEventInTenant(eventId: number, tenantId?: number): Promise<void> {
    const event = await this.eventsRepository.findOne({
      where: this.withTenantScope({ id: eventId }, tenantId),
      select: ['id'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }
  }

  private ensureCategoryInTenant(category: CategoryEntity, tenantId?: number): void {
    if (tenantId === undefined) {
      return;
    }
    if (!category.event || category.event.tenant_id !== tenantId) {
      throw new NotFoundException('Category not found');
    }
  }

  private validateEventDateWindow(
    startDate: Date,
    endDate: Date,
    votingStart: Date,
    votingEnd: Date,
  ): void {
    if (startDate > endDate) {
      throw new BadRequestException('start_date must be before or equal to end_date');
    }
    if (votingStart > votingEnd) {
      throw new BadRequestException('voting_start must be before or equal to voting_end');
    }
    if (votingStart < startDate || votingEnd > endDate) {
      throw new BadRequestException('Voting window must be inside event start_date and end_date');
    }
  }

  /**
   * Helper: Convert CategoryEntity to ResponseDTO
   */
  private categoryToResponseDto(category: CategoryEntity): CategoryResponseDto {
    return {
      id: category.id,
      event_id: category.event_id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      voting_enabled: category.voting_enabled,
      public_voting: category.public_voting,
      paid_voting: category.paid_voting,
      minimum_vote_amount: category.minimum_vote_amount,
      daily_vote_limit: category.daily_vote_limit,
      max_votes_per_user: category.max_votes_per_user,
      created_at: category.created_at,
      updated_at: category.updated_at,
    };
  }

  private async generateUniqueCategorySlug(
    eventId: number,
    name: string,
    excludeCategoryId?: number,
  ): Promise<string> {
    const base = this.slugify(name) || 'category';
    let candidate = base;
    let counter = 2;

    while (true) {
      const existing = await this.categoriesRepository.findOne({
        where: { event_id: eventId, slug: candidate },
        select: ['id'],
      });

      if (!existing || (excludeCategoryId !== undefined && existing.id === excludeCategoryId)) {
        return candidate;
      }

      candidate = `${base}-${counter}`;
      counter += 1;
    }
  }

  private slugify(value: string): string {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Get event by slug (public endpoint)
   */
  async getEventBySlug(slug: string, tenantId?: number): Promise<EventResponseDto> {
    const where: any = { slug };
    if (tenantId !== undefined) where.tenant_id = tenantId;

    const event = await this.eventsRepository.findOne({
      where,
      relations: ['categories', 'contestants', 'creator'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return this.eventToResponseDto(event);
  }

  /**
   * Get currently active event (first ACTIVE event, public endpoint)
   */
  async getActiveEvent(tenantId?: number): Promise<EventResponseDto | null> {
    const where: any = { status: EventStatus.ACTIVE };
    if (tenantId !== undefined) where.tenant_id = tenantId;

    const event = await this.eventsRepository.findOne({
      where,
      order: { created_at: 'DESC' },
      relations: ['categories', 'creator'],
    });

    if (!event) return null;
    return this.eventToResponseDto(event);
  }

  /**
   * Get aggregate summary stats for an event
   */
  async getEventSummary(eventId: number): Promise<{
    total_votes: number;
    total_contestants: number;
    total_categories: number;
    total_revenue: number;
    is_live: boolean;
  }> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['categories', 'contestants'],
    });

    if (!event) throw new NotFoundException('Event not found');

    const totalVotes = event.contestants?.reduce((sum, c) => sum + (c.vote_count || 0), 0) ?? 0;
    const totalRevenue = event.contestants?.reduce((sum, c) => sum + Number(c.total_revenue || 0), 0) ?? 0;

    return {
      total_votes: totalVotes,
      total_contestants: event.contestants?.length ?? 0,
      total_categories: event.categories?.length ?? 0,
      total_revenue: totalRevenue,
      is_live: event.status === EventStatus.ACTIVE,
    };
  }

  /**
   * Get FAQ for an event (derived from event rules / terms)
   */
  getEventFaq(event: EventEntity): { question: string; answer: string }[] {
    return [
      {
        question: 'How do I vote?',
        answer: 'Select your favourite contestant and click the Vote button. You can vote for free once per category, or purchase additional votes.',
      },
      {
        question: 'How many times can I vote?',
        answer: event.max_votes_per_user
          ? `You can cast up to ${event.max_votes_per_user} votes per category.`
          : 'You get one free vote per category. Additional votes can be purchased.',
      },
      {
        question: 'Are votes secure?',
        answer: 'Yes. All votes are recorded, fraud-checked, and anchored to a blockchain for transparency.',
      },
      {
        question: 'What are the voting rules?',
        answer: event.rules || 'Votes are final and non-transferable. Fraud attempts will be disqualified.',
      },
      {
        question: 'When does voting end?',
        answer: event.voting_end
          ? `Voting closes on ${new Date(event.voting_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`
          : 'Check the event page for the voting deadline.',
      },
    ];
  }
}
