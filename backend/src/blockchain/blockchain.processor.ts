import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BlockchainService } from './blockchain.service';

export interface BlockchainAnchorJobData {
  voteBatchId: number;
  eventId: number;
}

@Processor('blockchain')
export class BlockchainProcessor extends WorkerHost {
  private readonly logger = new Logger(BlockchainProcessor.name);

  constructor(private readonly blockchainService: BlockchainService) {
    super();
  }

  async process(job: Job<BlockchainAnchorJobData>): Promise<any> {
    this.logger.log(`Processing blockchain anchor job ${job.id} for batch ${job.data.voteBatchId}`);
    try {
      const anchor = await this.blockchainService.createAnchor(
        job.data.voteBatchId,
        job.data.eventId,
      );
      this.logger.log(`Anchor created: ${anchor.id}`);
      return { anchorId: anchor.id };
    } catch (error) {
      this.logger.error(`Blockchain anchor job ${job.id} failed: ${(error as Error).message}`);
      throw error;
    }
  }
}
