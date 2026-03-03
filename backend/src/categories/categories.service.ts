import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from '@/entities/category.entity';
import { EventEntity } from '@/entities/event.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
  ) {}

  /**
   * Get all categories
   */
  async getAllCategories(
    page: number = 1,
    limit: number = 20,
    eventId?: number,
    tenantId?: number,
  ): Promise<{ data: CategoryEntity[]; pagination: any }> {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (eventId) {
      queryBuilder.andWhere('category.event_id = :eventId', { eventId });
    }

    if (tenantId !== undefined) {
      queryBuilder.innerJoin('category.event', 'event_scope')
        .andWhere('event_scope.tenant_id = :tenantId', { tenantId });
    }

    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);

    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('category.created_at', 'DESC')
      .getMany();

    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get categories by event
   */
  async getCategoriesByEvent(
    eventId: number,
    page: number = 1,
    limit: number = 50,
    tenantId?: number,
  ): Promise<{ data: CategoryEntity[]; pagination: any }> {
    if (tenantId !== undefined) {
      const event = await this.eventRepository.findOne({
        where: { id: eventId, tenant_id: tenantId },
        select: ['id'],
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
    }

    const queryBuilder = this.categoryRepository.createQueryBuilder('category');
    queryBuilder.where('category.event_id = :eventId', { eventId });

    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);

    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('category.display_order', 'ASC')
      .getMany();

    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number, tenantId?: number): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['event', 'contestants'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    if (tenantId !== undefined && category.event?.tenant_id !== tenantId) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  /**
   * Create new category
   */
  async createCategory(data: {
    eventId: number;
    name: string;
    description?: string;
    votingStart?: Date;
    votingEnd?: Date;
  }, tenantId?: number): Promise<CategoryEntity> {
    if (tenantId !== undefined) {
      const event = await this.eventRepository.findOne({
        where: { id: data.eventId, tenant_id: tenantId },
        select: ['id'],
      });
      if (!event) {
        throw new NotFoundException('Event not found in your tenant scope');
      }
    }

    const slug = await this.generateUniqueCategorySlug(data.eventId, data.name);

    const category = this.categoryRepository.create({
      event_id: data.eventId,
      name: data.name,
      slug,
      description: data.description,
      voting_start: data.votingStart,
      voting_end: data.votingEnd,
    });
    return this.categoryRepository.save(category);
  }

  /**
   * Update category
   */
  async updateCategory(
    id: number,
    data: {
      name?: string;
      description?: string;
      votingStart?: Date;
      votingEnd?: Date;
    },
    tenantId?: number,
  ): Promise<CategoryEntity> {
    const category = await this.getCategoryById(id, tenantId);

    if (data.name) {
      category.name = data.name;
      category.slug = await this.generateUniqueCategorySlug(
        category.event_id,
        data.name,
        category.id,
      );
    }
    if (data.description) category.description = data.description;
    if (data.votingStart) category.voting_start = data.votingStart;
    if (data.votingEnd) category.voting_end = data.votingEnd;

    return this.categoryRepository.save(category);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: number, tenantId?: number): Promise<void> {
    const category = await this.getCategoryById(id, tenantId);
    await this.categoryRepository.remove(category);
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
      const existing = await this.categoryRepository.findOne({
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
}
