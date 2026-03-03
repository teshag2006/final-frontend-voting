import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ExportsService } from './exports.service';

export interface ExportJobData {
  exportId: number;
}

@Processor('exports')
export class ExportsProcessor extends WorkerHost {
  private readonly logger = new Logger(ExportsProcessor.name);

  constructor(private readonly exportsService: ExportsService) {
    super();
  }

  async process(job: Job<ExportJobData>): Promise<any> {
    this.logger.log(`Processing export job ${job.id} for export record ${job.data.exportId}`);
    try {
      await this.exportsService.generateExportFile(job.data.exportId);
      return { success: true };
    } catch (error) {
      this.logger.error(`Export job ${job.id} failed: ${(error as Error).message}`);
      throw error;
    }
  }
}
