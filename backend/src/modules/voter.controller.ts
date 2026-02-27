import { Body, Controller, Delete, Get, Headers, Patch, Post } from '@nestjs/common';
import { DataStoreService } from '../core/data-store.service';
import { getRequestUser } from '../core/request-user';

@Controller('voter')
export class VoterController {
  constructor(private readonly db: DataStoreService) {}

  @Get('wallet')
  wallet(@Headers() headers: Record<string, string | string[] | undefined>) {
    const { userId } = getRequestUser(headers);
    return this.db.getVoterState(userId).wallet;
  }

  @Get('payments')
  payments(@Headers() headers: Record<string, string | string[] | undefined>) {
    const { userId } = getRequestUser(headers);
    return { payments: this.db.getVoterState(userId).payments };
  }

  @Post('payments')
  createPayment(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body()
    body: {
      paymentId?: string;
      votesPurchased?: number;
      amount?: number;
      currency?: string;
      paymentMethod?: string;
      eventName?: string;
      eventSlug?: string;
      contestantSlug?: string;
      purchaseType?: 'package' | 'direct';
      status?: 'pending' | 'confirmed' | 'failed' | 'refunded';
    },
  ) {
    const { userId } = getRequestUser(headers);
    const state = this.db.getVoterState(userId);
    const paymentId = String(body.paymentId || `txn-${Date.now()}`);
    const votes = Math.max(1, Number(body.votesPurchased || 1));
    const now = this.db.now();
    const payment = {
      paymentId,
      receiptNumber: `RCPT-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000)}`,
      voteQuantity: votes,
      amount: Number(body.amount || 0),
      currency: body.currency || 'USD',
      paymentMethod: body.paymentMethod || 'card',
      status: body.status || 'confirmed',
      eventName: body.eventName || 'Wallet Vote Package',
      eventSlug: body.eventSlug,
      contestantSlug: body.contestantSlug,
      purchaseType: body.purchaseType || (body.contestantSlug ? 'direct' : 'package'),
      createdAt: now,
    };
    state.payments.unshift(payment as any);
    if (payment.status === 'confirmed') {
      state.wallet.paidVotesRemaining += votes;
      state.wallet.totalPaidVotesPurchased += votes;
    }
    return { payment, wallet: state.wallet };
  }

  @Post('vote')
  vote(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body()
    body: {
      eventSlug?: string;
      eventName?: string;
      categoryId?: string;
      categoryName?: string;
      contestantName?: string;
      isPaid?: boolean;
      quantity?: number;
    },
  ) {
    const { userId } = getRequestUser(headers);
    const state = this.db.getVoterState(userId);
    const quantity = Math.max(1, Number(body.quantity || 1));
    if (body.isPaid) {
      if (state.wallet.paidVotesRemaining < quantity) {
        return { message: 'Insufficient paid votes' };
      }
      state.wallet.paidVotesRemaining -= quantity;
      state.wallet.totalVotesUsed += quantity;
    } else {
      state.wallet.totalVotesUsed += 1;
    }
    const vote = {
      id: `vote-${Date.now()}`,
      eventName: body.eventName || body.eventSlug || 'Event',
      categoryName: body.categoryName || 'Category',
      contestant: {
        firstName: String(body.contestantName || 'Contestant').split(' ')[0],
        lastName: String(body.contestantName || 'Choice').split(' ').slice(1).join(' ') || 'Choice',
        profileImageUrl: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Vote',
      },
      freeVotes: body.isPaid ? 0 : 1,
      paidVotes: body.isPaid ? quantity : 0,
      totalVotes: body.isPaid ? quantity : 1,
      votedAt: this.db.now(),
    };
    state.votes.unshift(vote as any);
    return { vote, wallet: state.wallet };
  }

  @Get('my-votes')
  myVotes(@Headers() headers: Record<string, string | string[] | undefined>) {
    const { userId } = getRequestUser(headers);
    return { votes: this.db.getVoterState(userId).votes };
  }

  @Get('profile')
  profile(@Headers() headers: Record<string, string | string[] | undefined>) {
    const { userId } = getRequestUser(headers);
    return this.db.getVoterState(userId).profile;
  }

  @Patch('profile')
  patchProfile(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: { fullName?: string },
  ) {
    const { userId } = getRequestUser(headers);
    const profile = this.db.getVoterState(userId).profile;
    if (body.fullName) profile.fullName = String(body.fullName).trim();
    return profile;
  }

  @Post('verify-phone')
  verifyPhone(
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Body() body: { phoneNumber?: string },
  ) {
    const { userId } = getRequestUser(headers);
    const state = this.db.getVoterState(userId);
    state.profile.phoneVerified = true;
    state.profile.phoneNumber = String(body.phoneNumber || '+251900000000');
    state.wallet.freeVotes = state.wallet.freeVotes.map((f) => ({ ...f, isEligible: true, isAvailable: !f.isUsed }));
    return { success: true, wallet: state.wallet };
  }

  @Delete('account')
  deleteAccount(@Headers() headers: Record<string, string | string[] | undefined>) {
    const { userId } = getRequestUser(headers);
    this.db.voterByUserId.delete(userId);
    return { success: true };
  }
}
