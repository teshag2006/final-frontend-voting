import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyticsViewsResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Analytics views retrieved' })
  message: string;

  @ApiProperty({
    type: [String],
    example: ['payment_status_overview', 'real_time_leaderboard', 'system_health_overview'],
  })
  data: string[];

  @ApiProperty({ example: '2026-02-16T12:00:00.000Z' })
  timestamp: string;
}

export class AnalyticsViewMetaDto {
  @ApiProperty({ example: 'payment_status_overview' })
  view: string;

  @ApiProperty({ example: 100 })
  limit: number;

  @ApiPropertyOptional({ example: 1 })
  eventId?: number;

  @ApiPropertyOptional({ example: 30 })
  days?: number;
}

export class AnalyticsViewResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Analytics view data retrieved' })
  message: string;

  @ApiProperty({
    type: [Object],
    description: 'Rows returned from the selected SQL view',
    example: [{ event_id: 1, event_name: 'Q1 2026 Talent Show', total_payments: 50 }],
  })
  data: Record<string, any>[];

  @ApiProperty({ type: AnalyticsViewMetaDto })
  meta: AnalyticsViewMetaDto;

  @ApiProperty({ example: '2026-02-16T12:00:00.000Z' })
  timestamp: string;
}

export class AnalyticsFullMetaDto {
  @ApiProperty({ example: 100 })
  limit: number;

  @ApiPropertyOptional({ example: 1 })
  eventId?: number;

  @ApiPropertyOptional({ example: 30 })
  days?: number;
}

export class AnalyticsFullResponseDto {
  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ example: 'Full analytics snapshot retrieved' })
  message: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { type: 'object' },
    },
    description: 'Dictionary of view name -> rows',
    example: {
      system_health_overview: [{ healthy_checks: 20, warning_checks: 2, critical_checks: 0 }],
      payment_status_overview: [{ event_id: 1, provider: 'stripe', total_payments: 30 }],
    },
  })
  data: Record<string, Record<string, any>[]>;

  @ApiProperty({ type: AnalyticsFullMetaDto })
  meta: AnalyticsFullMetaDto;

  @ApiProperty({ example: '2026-02-16T12:00:00.000Z' })
  timestamp: string;
}
