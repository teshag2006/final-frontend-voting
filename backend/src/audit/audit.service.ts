import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity, AuditAction } from '@/entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  async log(params: {
    userId?: number;
    action: AuditAction;
    resourceType?: string;
    resourceId?: number;
    changes?: Record<string, any>;
    description?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const entry = this.auditLogRepository.create({
        user_id: params.userId,
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId,
        changes: params.changes,
        description: params.description,
        ip_address: params.ipAddress?.substring(0, 45),
        user_agent: params.userAgent,
      });
      await this.auditLogRepository.save(entry);
    } catch (error) {
      // Audit logging must never break the request flow
      this.logger.error(`Failed to write audit log: ${(error as Error).message}`);
    }
  }
}
