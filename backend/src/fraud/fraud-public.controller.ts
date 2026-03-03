import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FraudService } from './fraud.service';
import { FraudLogEntity } from '../entities/fraud-log.entity';

/**
 * Public Fraud Dashboard Controller
 * Accessible without authentication - for Telegram/WhatsApp links
 */
@Controller('public/fraud')
export class FraudPublicController {
  constructor(private readonly fraudService: FraudService) {}

  /**
   * Get fraud summary for public display
   * GET /api/v1/public/fraud/summary
   * Access: Public (no auth required)
   *
   * This provides a simple summary that can be shown in Telegram/WhatsApp
   */
  @Get('summary')
  async getFraudSummary() {
    const stats = await this.fraudService.getFraudDashboardStats();
    const recentCases = await this.fraudService.getFraudCases(1, 5);

    return {
      statusCode: 200,
      data: {
        summary: {
          totalAlerts: stats.totalFraudCases,
          criticalAlerts: stats.highSeverity,
          pendingAlerts: stats.pendingCases,
          resolvedAlerts: stats.resolvedCases,
        },
        recentAlerts: recentCases.data.map((caseItem: any) => ({
          id: caseItem.id,
          type: caseItem.fraud_type,
          severity: caseItem.severity,
          isResolved: caseItem.is_resolved,
          timestamp: caseItem.created_at,
          description: caseItem.description?.substring(0, 100),
        })),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get recent fraud alerts
   * GET /api/v1/public/fraud/alerts
   * Access: Public (no auth required)
   */
  @Get('alerts')
  async getRecentAlerts(
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.fraudService.getFraudCases(1, limit);

    return {
      statusCode: 200,
      data: {
        alerts: result.data.map((caseItem: any) => ({
          id: caseItem.id,
          type: caseItem.fraud_type,
          severity: caseItem.severity,
          isResolved: caseItem.is_resolved,
          timestamp: caseItem.created_at,
          description: caseItem.description?.substring(0, 200),
        })),
        pagination: result.pagination,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get specific fraud alert details
   * GET /api/v1/public/fraud/alert/:id
   * Access: Public (no auth required)
   */
  @Get('alert/:id')
  async getAlertDetails(@Param('id', ParseIntPipe) id: number) {
    const fraudCase = await this.fraudService.getFraudCaseById(id);

    return {
      statusCode: 200,
      data: {
        id: fraudCase.id,
        type: fraudCase.fraud_type,
        severity: fraudCase.severity,
        isResolved: fraudCase.is_resolved,
        description: fraudCase.description?.substring(0, 200),
        detectedAt: fraudCase.created_at,
        resolvedAt: fraudCase.resolved_at,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get fraud statistics by type
   * GET /api/v1/public/fraud/stats
   * Access: Public (no auth required)
   */
  @Get('stats')
  async getFraudStats() {
    const stats = await this.fraudService.getFraudDashboardStats();
    
    // Get counts by severity
    const bySeverity = await this.fraudService.getFraudCases(1, 1000);
    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    
    bySeverity.data.forEach((item: FraudLogEntity) => {
      const severityKey = item.severity as keyof typeof severityCounts;
      if (severityKey in severityCounts) {
        severityCounts[severityKey]++;
      }
    });
    
    return {
      statusCode: 200,
      data: {
        total: stats.totalFraudCases,
        pending: stats.pendingCases,
        resolved: stats.resolvedCases,
        bySeverity: severityCounts,
        lastUpdated: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
