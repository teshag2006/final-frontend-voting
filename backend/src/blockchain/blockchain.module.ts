import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BlockchainAnchorEntity } from '@/entities/blockchain-anchor.entity';
import { MerkleProofEntity } from '@/entities/merkle-proof.entity';
import { VoteBatchEntity } from '@/entities/vote-batch.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { BlockchainService } from './blockchain.service';
import { Web3Service } from './web3.service';
import { BlockchainController } from './blockchain.controller';
import { BlockchainProcessor } from './blockchain.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BlockchainAnchorEntity,
      MerkleProofEntity,
      VoteBatchEntity,
      VoteEntity,
    ]),
    ConfigModule,
    BullModule.registerQueue({ name: 'blockchain' }),
  ],
  controllers: [BlockchainController],
  providers: [BlockchainService, Web3Service, BlockchainProcessor],
  exports: [BlockchainService, Web3Service],
})
export class BlockchainModule {}
