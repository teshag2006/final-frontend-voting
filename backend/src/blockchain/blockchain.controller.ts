import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/entities/user.entity';
import { BlockchainService } from './blockchain.service';

/**
 * Blockchain Controller
 * Handles blockchain anchoring and verification operations
 */
@Controller('admin/blockchain')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  /**
   * Get all blockchain anchor batches
   * GET /api/v1/admin/blockchain/batches
   * Access: Admin
   */
  @Get('batches')
  async getAnchorBatches(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('confirmed') confirmed?: boolean,
  ) {
    const result = await this.blockchainService.getAnchorBatches(page, limit, confirmed);
    return {
      statusCode: 200,
      message: 'Anchor batches retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get specific anchor batch
   * GET /api/v1/admin/blockchain/batches/:id
   * Access: Admin
   */
  @Get('batches/:id')
  async getAnchorBatch(@Param('id', ParseIntPipe) id: number) {
    const batch = await this.blockchainService.getAnchorBatchById(id);
    return {
      statusCode: 200,
      message: 'Anchor batch retrieved successfully',
      data: batch,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create new blockchain anchor
   * POST /api/v1/admin/blockchain/anchor
   * Access: Admin
   */
  @Post('anchor')
  async createAnchor(
    @Body() createAnchorDto: { voteBatchId: number; eventId: number },
  ) {
    const anchor = await this.blockchainService.createAnchor(
      createAnchorDto.voteBatchId,
      createAnchorDto.eventId,
    );
    return {
      statusCode: 201,
      message: 'Blockchain anchor created successfully',
      data: anchor,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get Merkle proof for a vote
   * GET /api/v1/admin/blockchain/merkle/:voteId
   * Access: Admin
   */
  @Get('merkle/:voteId')
  async getMerkleProof(@Param('voteId', ParseIntPipe) voteId: number) {
    const proof = await this.blockchainService.getMerkleProof(voteId);
    return {
      statusCode: 200,
      message: 'Merkle proof retrieved successfully',
      data: proof,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verify anchor batch
   * GET /api/v1/admin/blockchain/verify/:batchId
   * Access: Admin
   */
  @Get('verify/:batchId')
  async verifyAnchor(@Param('batchId', ParseIntPipe) batchId: number) {
    const result = await this.blockchainService.verifyAnchor(batchId);
    return {
      statusCode: 200,
      message: 'Anchor verification completed',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get blockchain statistics
   * GET /api/v1/admin/blockchain/stats
   * Access: Admin
   */
  @Get('stats')
  async getBlockchainStats() {
    const stats = await this.blockchainService.getBlockchainStats();
    return {
      statusCode: 200,
      message: 'Blockchain statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * TAMPER DETECTION: Check if specific anchor has been tampered with
   * GET /api/v1/admin/blockchain/tamper/:anchorId
   * Access: Admin
   */
  @Get('tamper/:anchorId')
  async detectTampering(@Param('anchorId', ParseIntPipe) anchorId: number) {
    const result = await this.blockchainService.detectTampering(anchorId);
    return {
      statusCode: 200,
      message: result.isTampered 
        ? 'TAMPERING DETECTED!' 
        : 'No tampering detected',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Run full integrity check on all blockchain anchors
   * GET /api/v1/admin/blockchain/integrity-check
   * Access: Admin
   */
  @Get('integrity-check')
  async runIntegrityCheck() {
    const result = await this.blockchainService.runIntegrityCheck();
    return {
      statusCode: 200,
      message: result.tamperedAnchors > 0 
        ? `WARNING: ${result.tamperedAnchors} tampered anchors detected!` 
        : 'All anchors verified clean',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Public Blockchain Controller
 * Read-only access for public transparency
 */
@Controller('public/blockchain')
export class PublicBlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  /**
   * Get blockchain summary
   * GET /api/v1/public/blockchain/summary/:eventId
   * Access: Public
   */
  @Get('summary/:eventId')
  async getBlockchainSummary(
    @Param('eventId', ParseIntPipe) eventId: number,
  ) {
    const summary = await this.blockchainService.getEventBlockchainSummary(eventId);
    return {
      statusCode: 200,
      message: 'Blockchain summary retrieved successfully',
      data: summary,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verify anchor batch (public)
   * GET /api/v1/public/blockchain/verify/:batchId
   * Access: Public
   */
  @Get('verify/:batchId')
  async verifyAnchorPublic(@Param('batchId', ParseIntPipe) batchId: number) {
    const result = await this.blockchainService.verifyAnchor(batchId);
    return {
      statusCode: 200,
      message: 'Anchor verification completed',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * PUBLIC VOTER VERIFICATION: Verify individual vote using receipt ID
   * GET /api/v1/public/blockchain/verify-vote/:receiptId
   * Access: Public - Any voter can verify their vote
   * 
   * How it works:
   * 1. Voter enters their receipt ID from vote confirmation
   * 2. System finds the vote and its Merkle proof
   * 3. System returns the Merkle root anchored on blockchain
   * 4. Voter can mathematically verify their vote hash is in the Merkle root
   */
  @Get('verify-vote/:receiptId')
  async verifyVoteByReceipt(@Param('receiptId') receiptId: string) {
    const result = await this.blockchainService.verifyVoteByReceipt(receiptId);
    return {
      statusCode: 200,
      message: result.isValid 
        ? '✅ Your vote has been verified and anchored to blockchain!' 
        : '❌ Vote verification failed',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get Merkle proof for public verification
   * GET /api/v1/public/blockchain/proof/:voteId
   * Access: Public
   */
  @Get('proof/:voteId')
  async getPublicMerkleProof(@Param('voteId', ParseIntPipe) voteId: number) {
    const result = await this.blockchainService.getPublicMerkleProof(voteId);
    return {
      statusCode: 200,
      message: result ? 'Merkle proof retrieved successfully' : 'Vote not found',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verify transaction on blockchain (on-chain verification)
   * GET /api/v1/public/blockchain/verify-on-chain/:txHash
   * Access: Public
   */
  @Get('verify-on-chain/:txHash')
  async verifyOnChain(@Param('txHash') txHash: string) {
    const result = await this.blockchainService.verifyOnChain(txHash);
    return {
      statusCode: 200,
      message: result.verified ? '✅ Transaction verified on blockchain' : '❌ Verification failed',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
