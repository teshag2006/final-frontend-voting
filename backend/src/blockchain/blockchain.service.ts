import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { BlockchainAnchorEntity, BlockchainStatus } from '@/entities/blockchain-anchor.entity';
import { MerkleProofEntity } from '@/entities/merkle-proof.entity';
import { VoteBatchEntity } from '@/entities/vote-batch.entity';
import { VoteEntity } from '@/entities/vote.entity';
import { Web3Service, AnchorResult } from './web3.service';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(
    @InjectRepository(BlockchainAnchorEntity)
    private anchorRepository: Repository<BlockchainAnchorEntity>,
    @InjectRepository(MerkleProofEntity)
    private merkleRepository: Repository<MerkleProofEntity>,
    @InjectRepository(VoteBatchEntity)
    private voteBatchRepository: Repository<VoteBatchEntity>,
    @InjectRepository(VoteEntity)
    private voteRepository: Repository<VoteEntity>,
    private web3Service: Web3Service,
  ) {}

  /**
   * Get all anchor batches
   */
  async getAnchorBatches(
    page: number = 1,
    limit: number = 20,
    confirmed?: boolean,
  ): Promise<{ data: BlockchainAnchorEntity[]; pagination: any }> {
    const queryBuilder = this.anchorRepository.createQueryBuilder('anchor');
    
    if (confirmed !== undefined) {
      const status = confirmed ? BlockchainStatus.SUCCESS : BlockchainStatus.PENDING;
      queryBuilder.andWhere('anchor.blockchain_status = :status', { status });
    }
    
    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);
    
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('anchor.created_at', 'DESC')
      .getMany();
    
    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Get anchor batch by ID
   */
  async getAnchorBatchById(id: number): Promise<BlockchainAnchorEntity> {
    const anchor = await this.anchorRepository.findOne({
      where: { id },
      relations: ['voteBatch', 'event'],
    });
    if (!anchor) {
      throw new BadRequestException('Anchor batch not found');
    }
    return anchor;
  }

  /**
   * Create new blockchain anchor - uses real Web3 blockchain
   */
  async createAnchor(
    voteBatchId: number,
    eventId: number,
  ): Promise<BlockchainAnchorEntity> {
    const voteBatch = await this.voteBatchRepository.findOne({
      where: { id: voteBatchId },
      relations: ['votes'],
    });
    if (!voteBatch) {
      throw new BadRequestException('Vote batch not found');
    }

    // Get all votes in this batch for merkle tree generation
    const votes = await this.voteRepository.find({
      where: { merkle_batch_id: String(voteBatchId) },
      order: { id: 'ASC' },
    });

    this.logger.log(`Creating blockchain anchor for batch ${voteBatchId} with ${votes.length} votes`);

    // Convert votes to format needed for merkle tree
    const votesForMerkle = votes.map((v: VoteEntity) => ({
      id: v.id,
      hash: v.vote_hash || `vote-${v.id}-${v.contestant_id}`,
    }));

    // Generate Merkle root from votes
    const merkleRoot = this.web3Service.generateMerkleRoot(votesForMerkle);

    // Anchor to blockchain
    let anchorResult: AnchorResult;
    
    try {
      anchorResult = await this.web3Service.anchorToBlockchain(
        merkleRoot,
        votes.length,
        eventId,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Blockchain anchoring failed: ${err.message}`);
      anchorResult = {
        success: false,
        merkleRoot,
        error: err.message,
      };
    }

    // Create anchor record
    const anchor = this.anchorRepository.create({
      batch_id: voteBatchId,
      event_id: eventId,
      blockchain_tx_hash: anchorResult.txHash || null,
      merkle_root: anchorResult.merkleRoot || merkleRoot,
      blockchain_status: anchorResult.success
        ? BlockchainStatus.SUCCESS
        : BlockchainStatus.FAILED,
      confirmations: anchorResult.success ? 1 : 0,
      confirmed_at: anchorResult.success ? new Date() : null,
      contract_address: this.web3Service['config']?.contractAddress || '',
      transaction_receipt: JSON.stringify({
        blockNumber: anchorResult.blockNumber,
        success: anchorResult.success,
        error: anchorResult.error,
      }),
      error_message: anchorResult.error || null,
    });

    const savedAnchor = await this.anchorRepository.save(anchor);

    // Generate and store Merkle proofs for each vote
    await this.generateAndStoreMerkleProofs(votes, savedAnchor);

    this.logger.log(`Created anchor ${savedAnchor.id} with tx: ${savedAnchor.blockchain_tx_hash}`);

    return savedAnchor;
  }

  /**
   * Generate and store Merkle proofs for all votes in a batch
   */
  private async generateAndStoreMerkleProofs(
    votes: VoteEntity[],
    anchor: BlockchainAnchorEntity,
  ): Promise<void> {
    // Convert votes for merkle tree
    const votesForMerkle = votes.map(v => ({
      id: v.id,
      hash: v.vote_hash || `vote-${v.id}-${v.contestant_id}`,
    }));

    for (const vote of votes) {
      const proof = this.web3Service.getMerkleProof(votesForMerkle, vote.id);
      
      const merkleProof = this.merkleRepository.create({
        vote_id: vote.id,
        batch_id: anchor.batch_id,
        merkle_root: anchor.merkle_root,
        merkle_path: JSON.stringify(proof),
        proof_hash: proof.length > 0 ? proof[proof.length - 1] : null,
        is_verified: false,
      } as DeepPartial<MerkleProofEntity>);

      await this.merkleRepository.save(merkleProof);
    }
  }

  /**
   * Get Merkle proof for a vote
   */
  async getMerkleProof(voteId: number): Promise<MerkleProofEntity | null> {
    return this.merkleRepository.findOne({
      where: { vote_id: voteId },
    });
  }

  /**
   * Verify anchor batch on blockchain
   */
  async verifyAnchor(batchId: number): Promise<{ verified: boolean; message: string }> {
    const anchor = await this.anchorRepository.findOne({
      where: { batch_id: batchId },
    });
    
    if (!anchor) {
      return { verified: false, message: 'Anchor not found' };
    }

    // Check local status first
    if (anchor.blockchain_status === BlockchainStatus.PENDING && anchor.blockchain_tx_hash) {
      // Try to verify on blockchain
      try {
        const verified = await this.web3Service.verifyAnchor(anchor.blockchain_tx_hash);
        
        if (verified.verified) {
          anchor.blockchain_status = BlockchainStatus.SUCCESS;
          anchor.confirmations = 1;
          anchor.confirmed_at = new Date();
          await this.anchorRepository.save(anchor);
        }
      } catch (error) {
        const err = error as Error;
        this.logger.error(`Verification failed: ${err.message}`);
      }
    }

    const isVerified = anchor.blockchain_status === BlockchainStatus.SUCCESS;
    
    return {
      verified: isVerified,
      message: isVerified 
        ? 'Anchor verified on blockchain' 
        : 'Anchor pending confirmation',
    };
  }

  /**
   * Get blockchain statistics
   */
  async getBlockchainStats(): Promise<any> {
    const totalAnchors = await this.anchorRepository.count();
    const confirmedAnchors = await this.anchorRepository.count({
      where: { blockchain_status: BlockchainStatus.SUCCESS },
    });
    const pendingAnchors = await this.anchorRepository.count({
      where: { blockchain_status: BlockchainStatus.PENDING },
    });

    const networkId = await this.web3Service.getNetworkId();
    const isConnected = await this.web3Service.isConnected();

    return {
      totalAnchors,
      confirmedAnchors,
      pendingAnchors,
      networkId,
      isConnected,
      contractAddress: this.web3Service['config']?.contractAddress || '',
    };
  }

  /**
   * Get event blockchain summary
   */
  async getEventBlockchainSummary(eventId: number): Promise<any> {
    const anchors = await this.anchorRepository.find({
      where: { event_id: eventId },
    });

    const confirmed = anchors.filter((a: BlockchainAnchorEntity) => a.blockchain_status === BlockchainStatus.SUCCESS).length;
    const pending = anchors.filter((a: BlockchainAnchorEntity) => a.blockchain_status === BlockchainStatus.PENDING).length;

    return {
      eventId,
      totalBatches: anchors.length,
      confirmedBatches: confirmed,
      pendingBatches: pending,
      confirmationRate: anchors.length > 0 
        ? Math.round((confirmed / anchors.length) * 100) 
        : 0,
    };
  }

  /**
   * Get Merkle proof for public verification
   */
  async getPublicMerkleProof(voteId: number): Promise<{
    merkleRoot: string;
    proof: string[];
    voteHash: string;
    verified: boolean;
  } | null> {
    const merkleProof = await this.getMerkleProof(voteId);
    
    if (!merkleProof) {
      return null;
    }

    return {
      merkleRoot: merkleProof.merkle_root ?? '',
      proof: JSON.parse(merkleProof.merkle_path || '[]'),
      voteHash: merkleProof.proof_hash,
      verified: merkleProof.is_verified,
    };
  }

  /**
   * Check blockchain connectivity
   */
  async checkBlockchainConnection(): Promise<{
    connected: boolean;
    networkId: number;
    blockNumber: number;
  }> {
    try {
      const networkId = await this.web3Service.getNetworkId();
      const isConnected = await this.web3Service.isConnected();
      
      return {
        connected: isConnected,
        networkId,
        blockNumber: 0, // Would need to add getBlockNumber to Web3Service
      };
    } catch (error) {
      return {
        connected: false,
        networkId: 0,
        blockNumber: 0,
      };
    }
  }

  /**
   * TAMPER DETECTION: Verify that anchored votes match database records
   * This detects if votes were added/modified after anchoring
   */
  async detectTampering(anchorId: number): Promise<{
    isTampered: boolean;
    issues: string[];
    details: {
      anchoredVotes: number;
      databaseVotes: number;
      missingVotes: number;
      extraVotes: number;
      voteCountMismatch: boolean;
      hashMismatch: boolean;
    };
  }> {
    const anchor = await this.anchorRepository.findOne({
      where: { id: anchorId },
      relations: ['voteBatch'],
    });

    if (!anchor) {
      return {
        isTampered: false,
        issues: ['Anchor not found'],
        details: { anchoredVotes: 0, databaseVotes: 0, missingVotes: 0, extraVotes: 0, voteCountMismatch: false, hashMismatch: false },
      };
    }

    const issues: string[] = [];
    const dbVotes = await this.voteRepository.find({
      where: { merkle_batch_id: String(anchor.batch_id) },
    });

    // Get stored merkle proofs
    const merkleProofs = await this.merkleRepository.find({
      where: { batch_id: anchor.batch_id },
    });

    const anchoredVotes = merkleProofs.length;
    const databaseVotes = dbVotes.length;

    // Check vote count mismatch
    const voteCountMismatch = anchoredVotes !== databaseVotes;
    if (voteCountMismatch) {
      issues.push(
        `Vote count mismatch: Anchored ${anchoredVotes} votes but DB has ${databaseVotes} votes`
      );
    }

    // Verify each vote's hash hasn't been altered
    let hashMismatch = false;
    const missingVotes: number[] = [];
    const extraVotes: number[] = [];

    for (const dbVote of dbVotes) {
      const proof = merkleProofs.find(p => p.vote_id === dbVote.id);
      if (!proof) {
        missingVotes.push(dbVote.id);
        issues.push(`Vote ${dbVote.id} exists in DB but was never anchored`);
      } else {
        // Re-verify the vote hash
        const expectedHash = dbVote.vote_hash || `vote-${dbVote.id}-${dbVote.contestant_id}`;
        if (proof.proof_hash !== expectedHash) {
          hashMismatch = true;
          issues.push(`Vote ${dbVote.id} hash has been modified after anchoring`);
        }
      }
    }

    // Check for extra votes that were added after anchoring
    for (const proof of merkleProofs) {
      const dbVote = dbVotes.find(v => v.id === proof.vote_id);
      if (!dbVote) {
        extraVotes.push(proof.vote_id);
        issues.push(`Anchored vote ${proof.vote_id} no longer exists in database - possible deletion`);
      }
    }

    const isTampered = voteCountMismatch || hashMismatch || missingVotes.length > 0 || extraVotes.length > 0;

    return {
      isTampered,
      issues,
      details: {
        anchoredVotes,
        databaseVotes,
        missingVotes: missingVotes.length,
        extraVotes: extraVotes.length,
        voteCountMismatch,
        hashMismatch,
      },
    };
  }

  /**
   * Comprehensive integrity check for all anchors
   */
  async runIntegrityCheck(): Promise<{
    totalAnchors: number;
    tamperedAnchors: number;
    cleanAnchors: number;
    results: Array<{
      anchorId: number;
      batchId: number;
      isTampered: boolean;
      issues: string[];
    }>;
  }> {
    const anchors = await this.anchorRepository.find();
    const results: Array<{
      anchorId: number;
      batchId: number;
      isTampered: boolean;
      issues: string[];
    }> = [];

    let tamperedCount = 0;

    for (const anchor of anchors) {
      const result = await this.detectTampering(anchor.id);
      results.push({
        anchorId: anchor.id,
        batchId: anchor.batch_id,
        isTampered: result.isTampered,
        issues: result.issues,
      });
      if (result.isTampered) tamperedCount++;
    }

    return {
      totalAnchors: anchors.length,
      tamperedAnchors: tamperedCount,
      cleanAnchors: anchors.length - tamperedCount,
      results,
    };
  }

  /**
   * Verify vote by receipt ID - PUBLIC endpoint for voters
   * This allows any voter to verify their vote was anchored
   */
  async verifyVoteByReceipt(receiptId: string): Promise<{
    isValid: boolean;
    voteId?: number;
    contestantId?: number;
    eventId?: number;
    merkleRoot?: string;
    proof?: string[];
    anchoredAt?: Date;
    message: string;
  }> {
    // Find vote by receipt ID
    const vote = await this.voteRepository.findOne({
      where: { receipt_id: receiptId },
    });

    if (!vote) {
      return {
        isValid: false,
        message: 'Receipt not found. Please check your receipt ID.',
      };
    }

    // Get Merkle proof
    const merkleProof = await this.merkleRepository.findOne({
      where: { vote_id: vote.id },
    });

    if (!merkleProof) {
      return {
        isValid: false,
        voteId: vote.id,
        message: 'Vote found but not yet anchored to blockchain.',
      };
    }

    return {
      isValid: true,
      voteId: vote.id,
      contestantId: vote.contestant_id,
      eventId: vote.event_id,
      merkleRoot: merkleProof.merkle_root ?? '',
      proof: JSON.parse(merkleProof.merkle_path || '[]'),
      anchoredAt: merkleProof.created_at,
      message: 'Your vote has been verified!',
    };
  }

  /**
   * Verify transaction on blockchain (on-chain verification)
   */
  async verifyOnChain(txHash: string): Promise<{
    verified: boolean;
    blockNumber?: number;
    timestamp?: Date;
    merkleRoot?: string;
    message: string;
  }> {
    try {
      const result = await this.web3Service.verifyAnchor(txHash);
      return {
        verified: result.verified,
        blockNumber: result.blockNumber,
        timestamp: result.timestamp,
        message: result.message,
      };
    } catch (error) {
      return {
        verified: false,
        message: 'Failed to verify on blockchain: ' + (error as Error).message,
      };
    }
  }
}
