import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity, EventStatus } from '@/entities/event.entity';
import { VoteEntity, VoteStatus } from '@/entities/vote.entity';
import { PaymentEntity, PaymentStatus } from '@/entities/payment.entity';
import { FraudLogEntity } from '@/entities/fraud-log.entity';
import { UserEntity } from '@/entities/user.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { BlockchainAnchorEntity } from '@/entities/blockchain-anchor.entity';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(EventEntity)
    private eventRepository: Repository<EventEntity>,
    @InjectRepository(VoteEntity)
    private voteRepository: Repository<VoteEntity>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(FraudLogEntity)
    private fraudLogRepository: Repository<FraudLogEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ContestantEntity)
    private contestantRepository: Repository<ContestantEntity>,
    @InjectRepository(BlockchainAnchorEntity)
    private blockchainAnchorRepository: Repository<BlockchainAnchorEntity>,
  ) {}

  /**
   * Get all dashboard data in a single aggregated response
   * Matches frontend admin-overview-mock.ts structure
   */
  async getDashboard(range: '24h' | '7d' = '24h') {
    const [systemMetrics, voteActivity, revenueAnalytics, fraudSummary, blockchainStatus] =
      await Promise.all([
        this.getSystemMetrics(),
        this.getVoteActivity(range),
        this.getRevenueAnalytics(),
        this.getFraudSummary(),
        this.getBlockchainStatus(),
      ]);

    return {
      systemMetrics,
      voteActivity,
      revenueAnalytics,
      fraudSummary,
      blockchainStatus,
    };
  }

  /**
   * System metrics card:
   * { activeEvents, totalVotes, totalRevenue, fraudReports, confirmedAnchors,
   *   totalUsers, totalContestants, paidVotes }
   */
  async getSystemMetrics() {
    const [
      activeEvents,
      totalVotes,
      paidVotes,
      fraudReports,
      confirmedAnchors,
      totalUsers,
      totalContestants,
      revenueResult,
    ] = await Promise.all([
      this.eventRepository.count({ where: { status: EventStatus.ACTIVE } }),
      this.voteRepository.count(),
      this.voteRepository.count({ where: { vote_type: 'paid' as any } }),
      this.fraudLogRepository.count(),
      this.blockchainAnchorRepository.count(),
      this.userRepository.count(),
      this.contestantRepository.count(),
      this.paymentRepository
        .createQueryBuilder('p')
        .select('SUM(p.amount)', 'total')
        .where('p.status = :status', { status: PaymentStatus.COMPLETED })
        .getRawOne(),
    ]);

    return {
      activeEvents,
      totalVotes,
      totalRevenue: Number(revenueResult?.total ?? 0),
      fraudReports,
      confirmedAnchors,
      totalUsers,
      totalContestants,
      paidVotes,
    };
  }

  /**
   * Vote activity chart data for given range (24h or 7d)
   * Returns { validVotes, pendingVotes, fraudFlaggedVotes } per time bucket
   */
  async getVoteActivity(range: '24h' | '7d' = '24h') {
    const hours = range === '7d' ? 168 : 24;
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const bucketExpr = range === '7d'
      ? "DATE(vote.created_at)"
      : "DATE_TRUNC('hour', vote.created_at)";

    const rows = await this.voteRepository
      .createQueryBuilder('vote')
      .select(bucketExpr, 'bucket')
      .addSelect("SUM(CASE WHEN vote.status = 'valid' THEN 1 ELSE 0 END)", 'validVotes')
      .addSelect("SUM(CASE WHEN vote.status = 'pending' THEN 1 ELSE 0 END)", 'pendingVotes')
      .addSelect("SUM(CASE WHEN vote.status = 'fraud_suspected' THEN 1 ELSE 0 END)", 'fraudFlaggedVotes')
      .where('vote.created_at >= :since', { since })
      .groupBy(bucketExpr)
      .orderBy('bucket', 'ASC')
      .getRawMany();

    return rows.map((r: any) => ({
      bucket: r.bucket,
      validVotes: Number(r.validVotes ?? 0),
      pendingVotes: Number(r.pendingVotes ?? 0),
      fraudFlaggedVotes: Number(r.fraudFlaggedVotes ?? 0),
    }));
  }

  /**
   * Revenue analytics by payment provider
   * Matches frontend revenueAnalytics mock: { breakdown: [{provider, amount, percentage}] }
   */
  async getRevenueAnalytics() {
    const rows = await this.paymentRepository
      .createQueryBuilder('p')
      .select('p.provider', 'provider')
      .addSelect('SUM(p.amount)', 'amount')
      .where('p.status = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('p.provider')
      .getRawMany();

    const totalRevenue = rows.reduce((sum: number, r: any) => sum + Number(r.amount ?? 0), 0);

    const breakdown = rows.map((r: any) => ({
      provider: r.provider,
      amount: Number(r.amount ?? 0),
      percentage: totalRevenue > 0
        ? Math.round((Number(r.amount ?? 0) / totalRevenue) * 10000) / 100
        : 0,
    }));

    return {
      totalRevenue,
      breakdown,
    };
  }

  /**
   * Fraud summary stats
   */
  async getFraudSummary() {
    const [total, resolved, unresolved] = await Promise.all([
      this.fraudLogRepository.count(),
      this.fraudLogRepository.count({ where: { is_resolved: true } }),
      this.fraudLogRepository.count({ where: { is_resolved: false } }),
    ]);

    return {
      totalCases: total,
      resolvedCases: resolved,
      openCases: unresolved,
    };
  }

  /**
   * Blockchain anchoring status
   */
  async getBlockchainStatus() {
    const [total, recent] = await Promise.all([
      this.blockchainAnchorRepository.count(),
      this.blockchainAnchorRepository.find({
        order: { created_at: 'DESC' } as any,
        take: 5,
      }),
    ]);

    return {
      totalAnchors: total,
      recentAnchors: recent.map((a: any) => ({
        id: a.id,
        tx_hash: a.tx_hash,
        created_at: a.created_at,
      })),
    };
  }
}
