import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { VoteWalletEntity } from '@/entities/vote-wallet.entity';
import { VoteTransactionEntity } from '@/entities/vote-transaction.entity';
import { VoteEntity, VoteStatus, VoteType } from '@/entities/vote.entity';
import { PaymentEntity } from '@/entities/payment.entity';
import { WalletVoteCreditEntity } from '@/entities/wallet-vote-credit.entity';
import { UserEntity, UserStatus } from '@/entities/user.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { VoteReceiptEntity } from '@/entities/vote-receipt.entity';
import { VotesService } from '@/votes/votes.service';
import { CastWalletVoteDto } from './dto/cast-wallet-vote.dto';
import { SubmitVoteDto } from './dto/submit-vote.dto';

@Injectable()
export class VoterService {
  constructor(
    @InjectRepository(VoteWalletEntity)
    private walletRepository: Repository<VoteWalletEntity>,
    @InjectRepository(VoteTransactionEntity)
    private voteTransactionRepository: Repository<VoteTransactionEntity>,
    @InjectRepository(WalletVoteCreditEntity)
    private walletVoteCreditRepository: Repository<WalletVoteCreditEntity>,
    @InjectRepository(VoteEntity)
    private voteRepository: Repository<VoteEntity>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ContestantEntity)
    private contestantRepository: Repository<ContestantEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(VoteReceiptEntity)
    private receiptRepository: Repository<VoteReceiptEntity>,
    private votesService: VotesService,
    private dataSource: DataSource,
  ) {}

  /**
   * Full voter dashboard:
   * - profile (fullName, email, phoneNumber, phoneVerified, googleLinked)
   * - payments (receiptNumber, eventName, voteQuantity, amount, currency, paymentMethod, status, createdAt)
   * - votes (eventName, categoryName, contestant, freeVotes, paidVotes, totalVotes, votedAt, receiptNumber)
   * - summary counters (totalVotes, totalPayments, freeVotesRemaining, paidVotesRemaining)
   */
  async getDashboard(userId: number) {
    const [user, wallets, payments, votes] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.walletRepository.find({ where: { user_id: userId } }),
      this.paymentRepository.find({
        where: { voter_id: userId },
        relations: ['event', 'contestant'],
        order: { created_at: 'DESC' },
        take: 20,
      }),
      this.voteRepository.find({
        where: { voter_id: userId },
        relations: ['event', 'category', 'contestant'],
        order: { created_at: 'DESC' },
        take: 20,
      }),
    ]);

    // The frontend dashboard expects a flattened shape:
    // { eventName, recentActivities, device, lastLogin, location, riskStatus }
    const primaryEventName =
      votes.find((row) => Boolean(row.event?.name))?.event?.name ||
      payments.find((row) => Boolean(row.event?.name))?.event?.name ||
      'Voter Workspace';

    const recentActivities = votes.slice(0, 20).map((vote) => ({
      date: vote.created_at.toISOString(),
      category: vote.category?.name || 'Category',
      contestant:
        `${vote.contestant?.first_name || ''} ${vote.contestant?.last_name || ''}`.trim() ||
        'Contestant',
      voteType: vote.vote_type === VoteType.PAID ? 'paid' : 'free',
      status: vote.status === VoteStatus.VALID ? 'confirmed' : 'under-review',
    }));

    return {
      eventName: primaryEventName,
      recentActivities,
      device: 'Unknown',
      lastLogin: user?.updated_at?.toISOString?.() || new Date().toISOString(),
      location: 'Unknown',
      riskStatus: 'low' as const,
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    return {
      fullName: [user.first_name, user.last_name].filter(Boolean).join(' ').trim(),
      email: user.email,
      phoneNumber: user.phone_number,
      phoneVerified: user.phone_verified,
      googleLinked: !!user.google_id,
      profileImageUrl: user.profile_image_url,
      createdAt: user.created_at,
    };
  }

  async updateProfile(userId: number, fullName: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const trimmed = String(fullName || '').trim();
    if (!trimmed) {
      throw new BadRequestException('fullName is required');
    }

    const [first, ...rest] = trimmed.split(/\s+/);
    user.first_name = first;
    user.last_name = rest.join(' ') || null as any;
    user.updated_at = new Date();
    await this.userRepository.save(user);

    return this.getProfile(userId);
  }

  async getPayments(userId: number) {
    const payments = await this.paymentRepository.find({
      where: { voter_id: userId },
      relations: ['event', 'contestant'],
      order: { created_at: 'DESC' },
      take: 50,
    });

    return {
      payments: payments.map((p) => ({
        receiptNumber: p.transaction_reference || p.provider_tx_id || `PAY-${p.id}`,
        eventName: p.event?.name ?? 'Unknown Event',
        voteQuantity: p.votes_purchased ?? 0,
        amount: Number(p.amount),
        currency: p.currency ?? 'USD',
        paymentMethod: p.provider,
        status: p.status,
        createdAt: p.created_at,
      })),
    };
  }

  async getMyVotes(userId: number) {
    const votes = await this.voteRepository.find({
      where: { voter_id: userId },
      relations: ['event', 'category', 'contestant'],
      order: { created_at: 'DESC' },
      take: 100,
    });

    const votesByKey = new Map<
      string,
      {
        eventName: string;
        categoryName: string;
        contestant: { id: number; name: string; photo: string | null };
        freeVotes: number;
        paidVotes: number;
        totalVotes: number;
        votedAt: Date;
        receiptNumber: string | null;
      }
    >();

    for (const v of votes) {
      const key = `${v.event_id}-${v.category_id}-${v.contestant_id}`;
      const contestantName = v.contestant
        ? `${v.contestant.first_name} ${v.contestant.last_name}`.trim()
        : 'Unknown';
      if (!votesByKey.has(key)) {
        votesByKey.set(key, {
          eventName: v.event?.name ?? 'Unknown Event',
          categoryName: v.category?.name ?? 'Unknown Category',
          contestant: {
            id: v.contestant_id,
            name: contestantName,
            photo: v.contestant?.profile_image_url ?? null,
          },
          freeVotes: 0,
          paidVotes: 0,
          totalVotes: 0,
          votedAt: v.created_at,
          receiptNumber: v.receipt_id ?? null,
        });
      }
      const row = votesByKey.get(key)!;
      row.totalVotes += 1;
      if (v.vote_type === VoteType.FREE) {
        row.freeVotes += 1;
      } else {
        row.paidVotes += 1;
      }
      if (v.created_at > row.votedAt) {
        row.votedAt = v.created_at;
      }
    }

    return { votes: Array.from(votesByKey.values()) };
  }

  async verifyPhone(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.phone_verified = true;
    user.phone_verified_at = new Date();
    user.updated_at = new Date();
    await this.userRepository.save(user);

    return { success: true };
  }

  async deleteAccount(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.status = UserStatus.DELETED;
    user.deleted_at = new Date();
    user.updated_at = new Date();
    await this.userRepository.save(user);

    return { success: true };
  }

  async getWallet(userId: number, eventId?: number, categoryId?: number) {
    const where: Record<string, number> = { user_id: userId };
    if (eventId !== undefined) where.event_id = eventId;
    if (categoryId !== undefined) where.category_id = categoryId;

    const [wallets, user, categories, votes] = await Promise.all([
      this.walletRepository.find({
        where,
        order: { updated_at: 'DESC' },
      }),
      this.userRepository.findOne({ where: { id: userId } }),
      this.categoryRepository.find(),
      this.voteRepository.find({
        where: { voter_id: userId },
        relations: ['category', 'contestant'],
        order: { created_at: 'DESC' },
        take: 20,
      }),
    ]);

    const categoryNameById = new Map<number, string>(
      categories.map((c) => [c.id, c.name]),
    );

    const paidVotesRemaining = wallets.reduce(
      (sum, wallet) => sum + Math.max(0, wallet.paid_votes_purchased - wallet.paid_votes_used),
      0,
    );
    const totalPaidVotesPurchased = wallets.reduce(
      (sum, wallet) => sum + Number(wallet.paid_votes_purchased || 0),
      0,
    );
    const totalVotesUsed = wallets.reduce(
      (sum, wallet) =>
        sum +
        Number(wallet.paid_votes_used || 0) +
        (wallet.free_vote_used ? 1 : 0),
      0,
    );

    const phoneVerified = Boolean(user?.phone_verified);
    const freeVotes = wallets.map((wallet) => ({
        categoryId: String(wallet.category_id),
        categoryName:
          categoryNameById.get(wallet.category_id) || `Category ${wallet.category_id}`,
        isAvailable: !wallet.free_vote_used,
        isUsed: Boolean(wallet.free_vote_used),
        isEligible: phoneVerified,
        remaining: wallet.free_vote_used ? 0 : 1,
      }));

    const recentActivities = votes.map((vote) => ({
      date: vote.created_at.toISOString(),
      category: vote.category?.name || 'Category',
      contestant:
        `${vote.contestant?.first_name || ''} ${vote.contestant?.last_name || ''}`.trim() ||
        'Contestant',
      voteType: vote.vote_type === VoteType.PAID ? 'paid' : 'free',
      status: vote.status === VoteStatus.VALID ? 'confirmed' : 'under-review',
    }));

    return {
      isPhoneVerified: phoneVerified,
      phoneNumber: user?.phone_number || '',
      paidVotesRemaining,
      totalPaidVotesPurchased,
      totalVotesUsed,
      freeVotes,
      recentActivities,
    };
  }

  async getVoteEligibility(
    userId: number | undefined,
    eventId: number,
    contestantId: number,
  ) {
    const contestant = await this.contestantRepository.findOne({
      where: { id: contestantId },
      select: ['id', 'event_id', 'category_id'],
    });
    if (!contestant || contestant.event_id !== eventId) {
      throw new BadRequestException('Contestant does not belong to event');
    }

    const category = await this.categoryRepository.findOne({
      where: { id: contestant.category_id },
      select: ['id', 'daily_vote_limit', 'max_votes_per_user'],
    });

    const dailyLimit = Number(category?.daily_vote_limit ?? 50);
    const totalLimit = Number(category?.max_votes_per_user ?? 300);

    if (!userId) {
      return {
        freeEligible: false,
        freeUsed: false,
        dailyVotesRemaining: dailyLimit,
        totalVotesRemaining: totalLimit,
        requiresPayment: true,
      };
    }

    const userWallet = await this.walletRepository.findOne({
      where: {
        user_id: userId,
        event_id: eventId,
        category_id: contestant.category_id,
      },
    });

    const freeUsed = Boolean(userWallet?.free_vote_used);
    const usedToday = Number(userWallet?.daily_paid_used || 0) + (freeUsed ? 1 : 0);
    const totalUsed =
      Number(userWallet?.paid_votes_used || 0) + (freeUsed ? 1 : 0);

    const dailyVotesRemaining = Math.max(0, dailyLimit - usedToday);
    const totalVotesRemaining = Math.max(0, totalLimit - totalUsed);
    const freeEligible = !freeUsed;

    return {
      freeEligible,
      freeUsed,
      dailyVotesRemaining,
      totalVotesRemaining,
      requiresPayment: !freeEligible,
    };
  }

  async submitVoteFromUi(userId: number, dto: SubmitVoteDto) {
    const categoryId = Number.parseInt(dto.categoryId, 10);
    const quantity = Math.max(1, Number(dto.quantity || 1));

    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      throw new BadRequestException('categoryId is invalid');
    }

    const parsedContestantId = dto.contestantId
      ? Number.parseInt(dto.contestantId, 10)
      : undefined;
    if (
      dto.contestantId !== undefined &&
      (!Number.isFinite(parsedContestantId) || Number(parsedContestantId) <= 0)
    ) {
      throw new BadRequestException('contestantId is invalid');
    }

    const contestant = parsedContestantId
      ? await this.contestantRepository.findOne({
          where: { id: parsedContestantId },
          select: ['id', 'event_id', 'category_id'],
        })
      : await this.contestantRepository.findOne({
          where: { category_id: categoryId },
          order: { vote_count: 'DESC' },
          select: ['id', 'event_id', 'category_id'],
        });
    if (!contestant) {
      throw new BadRequestException('Contestant not found');
    }

    const castVoteDto: CastWalletVoteDto = {
      eventId: contestant.event_id,
      categoryId: contestant.category_id,
      contestantId: contestant.id,
      voteType: dto.isPaid ? VoteType.PAID : VoteType.FREE,
    };

    const votes = [] as Array<{ vote: unknown; wallet: unknown }>;
    for (let i = 0; i < quantity; i += 1) {
      const row = await this.castVote(userId, castVoteDto);
      votes.push(row);
    }

    const wallet = await this.getWallet(
      userId,
      contestant.event_id,
      contestant.category_id,
    );
    return {
      success: true,
      quantity,
      votes,
      wallet,
    };
  }

  async getTransactions(userId: number, page: number = 1, limit: number = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const [data, total] = await this.voteTransactionRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      data,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit),
      },
    };
  }

  async castVote(userId: number, dto: CastWalletVoteDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let wallet = await queryRunner.manager
        .createQueryBuilder(VoteWalletEntity, 'wallet')
        .setLock('pessimistic_write')
        .where('wallet.user_id = :userId', { userId })
        .andWhere('wallet.event_id = :eventId', { eventId: dto.eventId })
        .andWhere('wallet.category_id = :categoryId', { categoryId: dto.categoryId })
        .getOne();

      if (!wallet) {
        wallet = queryRunner.manager.create(VoteWalletEntity, {
          user_id: userId,
          event_id: dto.eventId,
          category_id: dto.categoryId,
        });
        wallet = await queryRunner.manager.save(VoteWalletEntity, wallet);
      }

      const remainingPaidVotes = Math.max(0, wallet.paid_votes_purchased - wallet.paid_votes_used);
      const requestedType = dto.voteType;
      const selectedType =
        requestedType ??
        (!wallet.free_vote_used ? VoteType.FREE : remainingPaidVotes > 0 ? VoteType.PAID : undefined);

      if (!selectedType) {
        throw new BadRequestException('No available votes in wallet for this category');
      }

      if (selectedType === VoteType.FREE && wallet.free_vote_used) {
        throw new BadRequestException('Free vote already used for this event/category');
      }

      let sourcePaymentId: number | null = null;

      if (selectedType === VoteType.PAID) {
        const credits = await queryRunner.manager
          .createQueryBuilder(WalletVoteCreditEntity, 'credit')
          .setLock('pessimistic_write')
          .where('credit.wallet_id = :walletId', { walletId: wallet.id })
          .andWhere('credit.votes_remaining > 0')
          .orderBy('credit.created_at', 'ASC')
          .getMany();

        if (credits.length === 0) {
          throw new BadRequestException('No paid votes remaining in wallet');
        }

        const credit = credits[0];
        credit.votes_remaining -= 1;
        sourcePaymentId = credit.payment_id;
        await queryRunner.manager.save(WalletVoteCreditEntity, credit);

        wallet.paid_votes_used += 1;
        wallet.daily_paid_used += 1;
      } else {
        wallet.free_vote_used = true;
      }

      wallet.last_vote_at = new Date();
      await queryRunner.manager.save(VoteWalletEntity, wallet);

      const vote = await this.votesService.castVote(
        userId,
        {
          eventId: dto.eventId,
          categoryId: dto.categoryId,
          contestantId: dto.contestantId,
          voteType: selectedType,
          paymentId: sourcePaymentId ?? undefined,
          deviceFingerprint: dto.deviceFingerprint,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
        },
        {
          allowPaidFromWallet: selectedType === VoteType.PAID,
        },
      );

      await queryRunner.manager.save(
        VoteTransactionEntity,
        queryRunner.manager.create(VoteTransactionEntity, {
          user_id: userId,
          wallet_id: wallet.id,
          contestant_id: dto.contestantId,
          vote_type: selectedType.toUpperCase(),
          payment_reference: sourcePaymentId ? String(sourcePaymentId) : null,
          ip_address: dto.ipAddress || null,
          device_fingerprint: dto.deviceFingerprint || null,
          risk_score: vote.fraud_risk_score ? Math.round(vote.fraud_risk_score * 100) : null,
        }),
      );

      await queryRunner.commitTransaction();

      return {
        vote,
        wallet: {
          ...wallet,
          remaining_paid_votes: Math.max(0, wallet.paid_votes_purchased - wallet.paid_votes_used),
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
