import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { UserEntity } from '@/entities/user.entity';
import { VoterService } from './voter.service';
import { SubmitVoteDto } from './dto/submit-vote.dto';

@Controller('voter')
@UseGuards(JwtGuard)
export class VoterController {
  constructor(private readonly voterService: VoterService) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: UserEntity) {
    return {
      statusCode: 200,
      message: 'Voter dashboard retrieved successfully',
      data: await this.voterService.getDashboard(user.id),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: UserEntity) {
    return {
      statusCode: 200,
      message: 'Voter profile retrieved successfully',
      data: await this.voterService.getProfile(user.id),
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: UserEntity,
    @Body() body: { fullName?: string },
  ) {
    return {
      statusCode: 200,
      message: 'Voter profile updated successfully',
      data: await this.voterService.updateProfile(user.id, String(body?.fullName || '')),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('wallet')
  async getWallet(
    @CurrentUser() user: UserEntity,
    @Query('eventId') eventId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return {
      statusCode: 200,
      message: 'Voter wallet retrieved successfully',
      data: await this.voterService.getWallet(
        user.id,
        eventId ? Number(eventId) : undefined,
        categoryId ? Number(categoryId) : undefined,
      ),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('payments')
  async getPayments(@CurrentUser() user: UserEntity) {
    return {
      statusCode: 200,
      message: 'Voter payments retrieved successfully',
      data: await this.voterService.getPayments(user.id),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('my-votes')
  async getMyVotes(@CurrentUser() user: UserEntity) {
    return {
      statusCode: 200,
      message: 'Voter votes retrieved successfully',
      data: await this.voterService.getMyVotes(user.id),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('vote')
  async castVote(
    @CurrentUser() user: UserEntity,
    @Body() submitVoteDto: SubmitVoteDto,
  ) {
    return {
      statusCode: 201,
      message: 'Vote cast via wallet flow',
      data: await this.voterService.submitVoteFromUi(user.id, submitVoteDto),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('verify-phone')
  async verifyPhone(@CurrentUser() user: UserEntity) {
    return {
      statusCode: 200,
      message: 'Phone verified successfully',
      data: await this.voterService.verifyPhone(user.id),
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('account')
  async deleteAccount(@CurrentUser() user: UserEntity) {
    return {
      statusCode: 200,
      message: 'Account deleted successfully',
      data: await this.voterService.deleteAccount(user.id),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('transactions')
  async getTransactions(
    @CurrentUser() user: UserEntity,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.voterService.getTransactions(
      user.id,
      this.parsePositiveInt(page, 1),
      this.parsePositiveInt(limit, 20),
    );
    return {
      statusCode: 200,
      message: 'Voter transactions retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  private parsePositiveInt(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(1, Math.trunc(parsed));
  }
}
