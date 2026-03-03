import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import {
  extractAuthenticatedTenantId,
  parseOptionalTenantId,
} from '@/common/helpers/tenant.helper';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { VoteResponseDto } from './dto/vote-response.dto';
import { CreateVoteSchema, CreateVoteZodDto } from './dto/create-vote.zod';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

// Fast manual validation for maximum throughput - no decorators overhead
function fastValidateVote(data: any): { valid: boolean; errors?: string[]; parsed?: any } {
  const errors: string[] = [];
  
  // Fast integer validation
  const eventId = parseInt(data.eventId, 10);
  const categoryId = parseInt(data.categoryId, 10);
  const contestantId = parseInt(data.contestantId, 10);
  
  if (!Number.isInteger(eventId) || eventId <= 0) errors.push('eventId must be a positive integer');
  if (!Number.isInteger(categoryId) || categoryId <= 0) errors.push('categoryId must be a positive integer');
  if (!Number.isInteger(contestantId) || contestantId <= 0) errors.push('contestantId must be a positive integer');
  
  // Vote type validation
  const validVoteTypes = ['FREE', 'PAID', 'BONUS'];
  if (!data.voteType || !validVoteTypes.includes(data.voteType)) {
    errors.push('voteType must be FREE, PAID, or BONUS');
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return {
    valid: true,
    parsed: {
      eventId,
      categoryId,
      contestantId,
      voteType: data.voteType,
      paymentId: data.paymentId ? parseInt(data.paymentId, 10) : undefined,
      deviceFingerprint: data.deviceFingerprint,
      userAgent: data.userAgent,
      ipAddress: data.ipAddress,
      isAnonymous: data.isAnonymous === true || data.isAnonymous === 'true',
    },
  };
}

@ApiTags('Votes')
@ApiBearerAuth('JWT')
@Controller('votes')
@UseGuards(JwtGuard)
export class VotesController {
  constructor(private votesService: VotesService) {}

  /**
   * Cast a new vote
   * POST /api/v1/votes
   * Body: CreateVoteZodDto (validated with Zod for high performance)
   * Access: Protected (requires authentication for tenant isolation)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateVoteSchema))
  @ApiOperation({ summary: 'Cast a new vote' })
  @ApiResponse({ status: 201, description: 'Vote cast successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 403, description: 'Tenant context required' })
  async castVote(
    @Body() createVoteDto: CreateVoteZodDto,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    // Require authentication for tenant isolation and per-user vote limits
    const voterId = req.user?.id;
    if (!voterId) {
      throw new UnauthorizedException('Authentication required to cast a vote');
    }
    const tenantId = extractAuthenticatedTenantId(req);
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }
    const vote = await this.votesService.castVote(voterId, createVoteDto, { tenantId });

    return {
      statusCode: 201,
      message: 'Vote cast successfully',
      data: {
        voteId: vote.id,
        status: vote.status,
        fraudRiskLevel: vote.fraud_risk_level,
        fraudRiskScore: vote.fraud_risk_score,
        createdAt: vote.created_at,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Fast batch vote casting with manual validation
   * POST /api/v1/votes/batch-fast
   * Uses manual validation for maximum throughput
   * Access: Protected
   */
  @Post('batch-fast')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cast multiple votes with fast manual validation' })
  @ApiResponse({ status: 201, description: 'Votes cast successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async castVotesFast(
    @Body() body: { votes: any[] },
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const voterId = req.user?.id;
    if (!voterId) {
      throw new UnauthorizedException('Authentication required to cast votes');
    }
    const tenantId = extractAuthenticatedTenantId(req);
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    // Fast manual validation for all votes
    const results = [];
    const errors = [];

    for (let i = 0; i < body.votes.length; i++) {
      const voteData = body.votes[i];
      const validation = fastValidateVote(voteData);
      
      if (!validation.valid) {
        errors.push({ index: i, errors: validation.errors });
        continue;
      }

      try {
        const vote = await this.votesService.castVote(voterId, validation.parsed, { tenantId });
        results.push({ index: i, voteId: vote.id, status: vote.status });
      } catch (err: any) {
        errors.push({ index: i, error: err.message });
      }
    }

    return {
      statusCode: errors.length === 0 ? 201 : 207,
      message: errors.length === 0 ? 'All votes cast successfully' : 'Some votes failed',
      data: {
        successful: results,
        failed: errors,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * List votes (tenant-scoped)
   * GET /api/v1/votes
   * Access: Protected (requires authentication for tenant isolation)
   */
  @Get()
  @ApiOperation({ summary: 'List votes with tenant scoping' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'eventId', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'contestantId', required: false, type: Number })
  @ApiQuery({ name: 'voterId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Votes retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  async listVotes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('eventId') eventId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('contestantId') contestantId?: string,
    @Query('voterId') voterId?: string,
    @Query('status') status?: string,
    @Request() req?: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    // Require authentication for tenant-scoped listing
    const tenantId = extractAuthenticatedTenantId(req);
    if (tenantId === undefined) {
      throw new UnauthorizedException('Authentication required for listing votes');
    }
    const result = await this.votesService.listVotes({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      eventId: eventId ? Number(eventId) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      contestantId: contestantId ? Number(contestantId) : undefined,
      voterId: voterId ? Number(voterId) : undefined,
      status: status as any,
      tenantId,
    });

    return {
      statusCode: 200,
      message: 'Votes retrieved successfully',
      data: {
        items: result.data,
        pagination: result.pagination,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get vote details by ID
   * GET /api/v1/votes/:id
   * Access: Public
   */
  @Get(':id')
  async getVote(
    @Param('id', ParseIntPipe) voteId: number,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const vote = await this.votesService.getVoteById(voteId, tenantId);

    return {
      statusCode: 200,
      message: 'Vote retrieved successfully',
      data: {
        id: vote.id,
        eventId: vote.event_id,
        categoryId: vote.category_id,
        contestantId: vote.contestant_id,
        voterId: vote.voter_id,
        voteType: vote.vote_type,
        status: vote.status,
        fraudRiskLevel: vote.fraud_risk_level,
        fraudRiskScore: vote.fraud_risk_score,
        trustScore: vote.trust_score,
        isAnonymous: vote.is_anonymous,
        createdAt: vote.created_at,
        updatedAt: vote.updated_at,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get vote receipt
   * GET /api/v1/votes/:id/receipt
   * Access: Public
   */
  @Get(':id/receipt')
  async getVoteReceipt(
    @Param('id', ParseIntPipe) voteId: number,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const receipt = await this.votesService.getVoteReceipt(voteId, tenantId);

    return {
      statusCode: 200,
      message: 'Receipt retrieved successfully',
      data: {
        receiptCode: receipt.receipt_code,
        receiptHash: receipt.receipt_hash,
        verificationCode: receipt.verification_code,
        expiresAt: receipt.expires_at,
        createdAt: receipt.created_at,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Verify vote receipt
   * POST /api/v1/votes/verify/:receiptCode
   * Access: Public
   */
  @Post('verify/:receiptCode')
  async verifyReceipt(
    @Param('receiptCode') receiptCode: string,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const result = await this.votesService.verifyVoteReceipt(receiptCode, tenantId);

    if (!result.valid) {
      return {
        statusCode: 404,
        message: 'Receipt verification failed - invalid or expired receipt',
        data: { valid: false },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      statusCode: 200,
      message: 'Receipt verified successfully',
      data: {
        valid: true,
        voteId: result.vote?.id,
        eventId: result.vote?.event_id,
        contestantId: result.vote?.contestant_id,
        voteStatus: result.vote?.status,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get leaderboard for a category
   * GET /api/v1/votes/leaderboard/:eventId/:categoryId
   * Query params: limit (default 100)
   * Access: Public
   */
  @Get('leaderboard/:eventId/:categoryId')
  async getLeaderboard(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Request() req: any,
  ): Promise<{ statusCode: number; message: string; data: any; timestamp: string }> {
    const tenantId = extractAuthenticatedTenantId(req);
    const leaderboard = await this.votesService.getLeaderboard(eventId, categoryId, 100, tenantId);

    return {
      statusCode: 200,
      message: 'Leaderboard retrieved successfully',
      data: {
        eventId,
        categoryId,
        leaderboard: leaderboard.map((item) => ({
          rank: item.rank,
          contestantId: item.id,
          name: `${item.first_name} ${item.last_name}`,
          votes: item.vote_count,
          paidVotes: item.paid_vote_count,
          freeVotes: item.free_vote_count,
        })),
      },
      timestamp: new Date().toISOString(),
    };
  }

}
