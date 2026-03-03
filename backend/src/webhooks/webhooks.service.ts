import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEventEntity, WebhookStatus } from '@/entities/webhook-event.entity';
import { WebhookAttemptEntity } from '@/entities/webhook-attempt.entity';
import {
  CreateWebhookAttemptDto,
  CreateWebhookEventDto,
  UpdateWebhookEventDto,
} from './dto/webhook.dto';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(WebhookEventEntity)
    private webhookEventsRepository: Repository<WebhookEventEntity>,
    @InjectRepository(WebhookAttemptEntity)
    private webhookAttemptsRepository: Repository<WebhookAttemptEntity>,
  ) {}

  async listEvents(provider?: string, status?: WebhookStatus): Promise<WebhookEventEntity[]> {
    const where: Record<string, unknown> = {};
    if (provider) where.provider = provider;
    if (status) where.status = status;
    return this.webhookEventsRepository.find({
      where,
      order: { created_at: 'DESC' },
      relations: ['attempts'],
    });
  }

  async getEventById(id: number): Promise<WebhookEventEntity> {
    const data = await this.webhookEventsRepository.findOne({
      where: { id },
      relations: ['attempts'],
    });
    if (!data) throw new NotFoundException('Webhook event not found');
    return data;
  }

  async createEvent(dto: CreateWebhookEventDto): Promise<WebhookEventEntity> {
    const data = this.webhookEventsRepository.create({
      event_type: dto.event_type,
      provider: dto.provider,
      external_event_id: dto.external_event_id ?? null,
      payload: dto.payload,
      status: dto.status ?? WebhookStatus.RECEIVED,
      error_message: dto.error_message ?? null,
      processed_at: null,
      retry_count: 0,
    });
    return this.webhookEventsRepository.save(data);
  }

  async updateEvent(id: number, dto: UpdateWebhookEventDto): Promise<WebhookEventEntity> {
    const data = await this.getEventById(id);
    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === WebhookStatus.PROCESSED) {
        data.processed_at = new Date();
      }
    }
    if (dto.error_message !== undefined) data.error_message = dto.error_message;
    if (dto.retry_count !== undefined) data.retry_count = dto.retry_count;
    return this.webhookEventsRepository.save(data);
  }

  async listAttempts(eventId?: number): Promise<WebhookAttemptEntity[]> {
    const where = eventId === undefined ? {} : { webhook_event_id: eventId };
    return this.webhookAttemptsRepository.find({
      where,
      order: { created_at: 'DESC' },
      relations: ['webhook_event'],
    });
  }

  async createAttempt(dto: CreateWebhookAttemptDto): Promise<WebhookAttemptEntity> {
    const event = await this.webhookEventsRepository.findOne({
      where: { id: dto.webhook_event_id },
    });
    if (!event) throw new NotFoundException('Webhook event not found');

    const data = this.webhookAttemptsRepository.create({
      webhook_event_id: dto.webhook_event_id,
      attempt_number: dto.attempt_number ?? null,
      endpoint_url: dto.endpoint_url ?? null,
      http_status_code: dto.http_status_code ?? null,
      response_time_ms: dto.response_time_ms ?? null,
      success: dto.success ?? false,
      error_message: dto.error_message ?? null,
    });
    return this.webhookAttemptsRepository.save(data);
  }
}
