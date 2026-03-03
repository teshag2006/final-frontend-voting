import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { WebhookStatus } from '@/entities/webhook-event.entity';
import { WebhooksService } from './webhooks.service';
import {
  CreateWebhookAttemptDto,
  CreateWebhookEventDto,
  UpdateWebhookEventDto,
} from './dto/webhook.dto';

@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Get('events')
  async listEvents(
    @Query('provider') provider?: string,
    @Query('status') status?: WebhookStatus,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const data = await this.webhooksService.listEvents(provider, status);
    return {
      statusCode: 200,
      message: 'Webhook events retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('events/:id')
  async getEventById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const data = await this.webhooksService.getEventById(id);
    return {
      statusCode: 200,
      message: 'Webhook event retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  async createEvent(
    @Body() dto: CreateWebhookEventDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const data = await this.webhooksService.createEvent(dto);
    return {
      statusCode: 201,
      message: 'Webhook event created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('events/:id')
  @UseGuards(JwtGuard)
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWebhookEventDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const data = await this.webhooksService.updateEvent(id, dto);
    return {
      statusCode: 200,
      message: 'Webhook event updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('attempts')
  async listAttempts(
    @Query('eventId') eventId?: number,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const data = await this.webhooksService.listAttempts(eventId);
    return {
      statusCode: 200,
      message: 'Webhook attempts retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('attempts')
  @HttpCode(HttpStatus.CREATED)
  async createAttempt(
    @Body() dto: CreateWebhookAttemptDto,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const data = await this.webhooksService.createAttempt(dto);
    return {
      statusCode: 201,
      message: 'Webhook attempt created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
