import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { ExportEntity, ExportStatus } from '@/entities/export.entity';
import { EventEntity } from '@/entities/event.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { PaymentEntity } from '@/entities/payment.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { CreateExportDto, UpdateExportDto } from './dto/export.dto';

@Injectable()
export class ExportsService {
  private readonly logger = new Logger(ExportsService.name);
  private readonly exportDir = join(process.cwd(), 'uploads', 'exports');

  constructor(
    @InjectRepository(ExportEntity)
    private exportsRepository: Repository<ExportEntity>,
    @InjectRepository(EventEntity)
    private eventsRepository: Repository<EventEntity>,
    @InjectRepository(VoteEntity)
    private votesRepository: Repository<VoteEntity>,
    @InjectRepository(PaymentEntity)
    private paymentsRepository: Repository<PaymentEntity>,
    @InjectRepository(ContestantEntity)
    private contestantsRepository: Repository<ContestantEntity>,
  ) {}

  async listExports(
    eventId?: number,
    status?: ExportStatus,
    tenantId?: number,
  ): Promise<ExportEntity[]> {
    const qb = this.exportsRepository.createQueryBuilder('export')
      .leftJoinAndSelect('export.event', 'event')
      .leftJoinAndSelect('export.creator', 'creator');

    if (eventId !== undefined) {
      qb.andWhere('export.event_id = :eventId', { eventId });
    }
    if (status !== undefined) {
      qb.andWhere('export.export_status = :status', { status });
    }
    if (tenantId !== undefined) {
      qb.andWhere('event.tenant_id = :tenantId', { tenantId });
    }

    return qb.orderBy('export.created_at', 'DESC').getMany();
  }

  async getExportById(id: number, tenantId?: number): Promise<ExportEntity> {
    const data = await this.exportsRepository.findOne({
      where: { id },
      relations: ['event', 'creator'],
    });
    if (!data) throw new NotFoundException('Export not found');
    if (tenantId !== undefined && data.event?.tenant_id !== tenantId) {
      throw new NotFoundException('Export not found');
    }
    return data;
  }

  async createExport(userId: number, dto: CreateExportDto, tenantId?: number): Promise<ExportEntity> {
    const event = await this.eventsRepository.findOne({ where: { id: dto.event_id } });
    if (!event) throw new NotFoundException('Event not found');
    if (tenantId !== undefined && event.tenant_id !== tenantId) {
      throw new NotFoundException('Event not found');
    }

    const record = this.exportsRepository.create({
      event_id: dto.event_id,
      created_by: userId,
      export_type: dto.export_type ?? null,
      file_format: dto.file_format ?? null,
      file_url: dto.file_url ?? null,
      file_size: dto.file_size ?? null,
      export_status: dto.export_status ?? ExportStatus.GENERATING,
      rows_exported: dto.rows_exported ?? null,
      expires_at: dto.expires_at ? new Date(dto.expires_at) : null,
      downloaded_at: null,
    });

    return this.exportsRepository.save(record);
  }

  async updateExport(id: number, dto: UpdateExportDto, tenantId?: number): Promise<ExportEntity> {
    const record = await this.getExportById(id, tenantId);

    if (dto.export_type !== undefined) record.export_type = dto.export_type;
    if (dto.file_format !== undefined) record.file_format = dto.file_format;
    if (dto.file_url !== undefined) record.file_url = dto.file_url;
    if (dto.file_size !== undefined) record.file_size = dto.file_size;
    if (dto.export_status !== undefined) record.export_status = dto.export_status;
    if (dto.rows_exported !== undefined) record.rows_exported = dto.rows_exported;
    if (dto.expires_at !== undefined) {
      record.expires_at = dto.expires_at ? new Date(dto.expires_at) : null;
    }
    if (dto.downloaded_at !== undefined) {
      record.downloaded_at = dto.downloaded_at ? new Date(dto.downloaded_at) : null;
    }

    return this.exportsRepository.save(record);
  }

  async markDownloaded(id: number, tenantId?: number): Promise<ExportEntity> {
    const record = await this.getExportById(id, tenantId);
    record.downloaded_at = new Date();
    return this.exportsRepository.save(record);
  }

  async deleteExport(id: number, tenantId?: number): Promise<void> {
    const record = await this.getExportById(id, tenantId);
    await this.exportsRepository.remove(record);
  }

  /**
   * Generate actual export file (called by queue processor)
   */
  async generateExportFile(exportId: number): Promise<void> {
    const record = await this.exportsRepository.findOne({ where: { id: exportId } });
    if (!record) {
      this.logger.error(`Export ${exportId} not found`);
      return;
    }

    try {
      record.export_status = ExportStatus.GENERATING;
      await this.exportsRepository.save(record);

      const rows = await this.queryExportData(record.event_id, record.export_type);
      const csv = this.toCsv(rows);
      const fileName = `export-${exportId}-${Date.now()}.csv`;

      await mkdir(this.exportDir, { recursive: true });
      const filePath = join(this.exportDir, fileName);
      await writeFile(filePath, csv, 'utf-8');

      record.file_format = 'csv';
      record.file_url = `/uploads/exports/${fileName}`;
      record.file_size = Buffer.byteLength(csv, 'utf-8');
      record.rows_exported = rows.length;
      record.export_status = ExportStatus.READY;
      record.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await this.exportsRepository.save(record);

      this.logger.log(`Export ${exportId} generated: ${rows.length} rows`);
    } catch (error) {
      record.export_status = ExportStatus.FAILED;
      await this.exportsRepository.save(record);
      throw error;
    }
  }

  private async queryExportData(eventId: number, exportType?: string | null): Promise<Record<string, any>[]> {
    switch (exportType) {
      case 'votes':
        return this.votesRepository.find({
          where: { event_id: eventId },
          order: { created_at: 'DESC' },
          take: 50000,
        });
      case 'payments':
        return this.paymentsRepository.find({
          where: { event_id: eventId },
          order: { created_at: 'DESC' },
          take: 50000,
        });
      case 'contestants':
        return this.contestantsRepository.find({
          where: { event_id: eventId },
          order: { vote_count: 'DESC' },
          take: 50000,
        });
      default:
        // Default: export votes
        return this.votesRepository.find({
          where: { event_id: eventId },
          order: { created_at: 'DESC' },
          take: 50000,
        });
    }
  }

  private toCsv(rows: Record<string, any>[]): string {
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]).filter(
      (k) => typeof rows[0][k] !== 'object' || rows[0][k] === null,
    );
    const escape = (val: any): string => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const lines = [headers.join(',')];
    for (const row of rows) {
      lines.push(headers.map((h) => escape(row[h])).join(','));
    }
    return lines.join('\n');
  }

  private async ensureEventExists(eventId: number): Promise<void> {
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
  }
}
