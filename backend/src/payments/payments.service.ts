import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PaymentEntity, PaymentStatus, PaymentProvider } from '@/entities/payment.entity';
import { VoteEntity, VoteType, VoteStatus } from '@/entities/vote.entity';
import { VoteReceiptEntity } from '@/entities/vote-receipt.entity';
import { ContestantEntity } from '@/entities/contestant.entity';
import { EventEntity, EventStatus } from '@/entities/event.entity';
import { CategoryEntity } from '@/entities/category.entity';
import { RefundRequestEntity, RefundStatus } from '@/entities/refund-request.entity';
import { PaymentWebhookEntity, WebhookStatus } from '@/entities/payment-webhook.entity';
import { VoteWalletEntity } from '@/entities/vote-wallet.entity';
import { VoteTransactionEntity } from '@/entities/vote-transaction.entity';
import { WalletVoteCreditEntity } from '@/entities/wallet-vote-credit.entity';
import { UserEntity } from '@/entities/user.entity';
import { CreatePaymentDto, ProcessRefundDto, PaymentWebhookDto } from './dto/payment.dto';
import { ChapaService } from './chapa.service';
import { TelebirrService } from './telebirr.service';
import { SantimPayService } from './santimpay.service';
import * as crypto from 'crypto';

/**
 * Payments Service
 * Handles payment processing for 7 providers:
 * - Stripe
 * - PayPal
 * - Chapa
 * - Telebirr
 * - SantimPay
 * - Manual/Direct bank transfer
 * - Cryptocurrency
 * 
 * Flow:
 * 1. initiatePayment() - Creates payment record
 * 2. User completes payment on provider site
 * 3. Provider sends webhook -> handleWebhook()
 * 4. Payment confirmed -> createVoteFromPayment()
 * 5. Vote receipt generated and stored
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(PaymentEntity)
    private paymentsRepository: Repository<PaymentEntity>,
    @InjectRepository(VoteEntity)
    private votesRepository: Repository<VoteEntity>,
    @InjectRepository(VoteReceiptEntity)
    private voteReceiptRepository: Repository<VoteReceiptEntity>,
    @InjectRepository(ContestantEntity)
    private contestantsRepository: Repository<ContestantEntity>,
    @InjectRepository(EventEntity)
    private eventsRepository: Repository<EventEntity>,
    @InjectRepository(CategoryEntity)
    private categoriesRepository: Repository<CategoryEntity>,
    @InjectRepository(RefundRequestEntity)
    private refundRepository: Repository<RefundRequestEntity>,
    @InjectRepository(PaymentWebhookEntity)
    private webhookRepository: Repository<PaymentWebhookEntity>,
    @InjectRepository(VoteWalletEntity)
    private voteWalletRepository: Repository<VoteWalletEntity>,
    @InjectRepository(VoteTransactionEntity)
    private voteTransactionRepository: Repository<VoteTransactionEntity>,
    @InjectRepository(WalletVoteCreditEntity)
    private walletVoteCreditRepository: Repository<WalletVoteCreditEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private configService: ConfigService,
    private readonly httpService: HttpService,
    private chapaService: ChapaService,
    private telebirrService: TelebirrService,
    private santimPayService: SantimPayService,
    private dataSource: DataSource,
  ) {}

  /**
   * Get all payments with pagination and filters
   */
  async getAllPayments(
    page: number = 1,
    limit: number = 20,
    status?: string,
    provider?: string,
    tenantId?: number,
  ): Promise<{ data: PaymentEntity[]; pagination: any }> {
    const queryBuilder = this.paymentsRepository.createQueryBuilder('payment');

    if (tenantId !== undefined) {
      queryBuilder
        .innerJoin(EventEntity, 'event_scope', 'event_scope.id = payment.event_id')
        .andWhere('event_scope.tenant_id = :tenantId', { tenantId });
    }
    
    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }
    
    if (provider) {
      queryBuilder.andWhere('payment.provider = :provider', { provider });
    }
    
    const total = await queryBuilder.getCount();
    const pages = Math.ceil(total / limit);
    
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('payment.created_at', 'DESC')
      .getMany();
    
    return {
      data,
      pagination: { page, limit, total, pages },
    };
  }

  /**
   * Create new payment
   */
  async createPayment(
    userId: number,
    createPaymentDto: CreatePaymentDto,
    tenantId?: number,
  ): Promise<{
    paymentId: number;
    sessionId: string;
    redirectUrl: string;
    status: PaymentStatus;
    provider: PaymentProvider;
    transactionReference?: string | null;
  }> {
    const provider = createPaymentDto.provider as PaymentProvider;
    const result = await this.initiatePayment(
      userId,
      createPaymentDto.eventId,
      createPaymentDto.categoryId,
      createPaymentDto.contestantId,
      createPaymentDto.amount,
      createPaymentDto.voteQuantity,
      provider,
      createPaymentDto.currency,
      createPaymentDto.cryptoNetwork,
      tenantId,
    );

    const payment = await this.paymentsRepository.findOne({
      where: { id: result.paymentId },
      select: ['id', 'status', 'provider', 'transaction_reference'],
    });

    if (!payment) {
      throw new BadRequestException('Payment not found after initialization');
    }

    return {
      paymentId: result.paymentId,
      sessionId: result.sessionId,
      redirectUrl: result.redirectUrl,
      status: payment.status,
      provider: payment.provider,
      transactionReference: payment.transaction_reference ?? result.sessionId,
    };
  }

  async createCheckoutSessionFromUi(
    userId: number,
    contestantIdRaw: string,
    quantityRaw: number,
    tenantId?: number,
  ): Promise<{ unitPrice: number; totalAmount: number; transactionToken: string }> {
    const contestantId = Number.parseInt(String(contestantIdRaw), 10);
    const quantity = Math.max(1, Number(quantityRaw || 1));

    if (!Number.isFinite(contestantId) || contestantId <= 0) {
      throw new BadRequestException('contestantId is invalid');
    }

    const contestant = await this.contestantsRepository.findOne({
      where: { id: contestantId },
      relations: ['event'],
      select: ['id', 'event_id'],
    });

    if (!contestant) {
      throw new BadRequestException('Contestant not found');
    }

    const event = await this.eventsRepository.findOne({
      where: { id: contestant.event_id },
      select: ['id', 'vote_price', 'tenant_id'],
    });

    if (!event) {
      throw new BadRequestException('Event not found');
    }

    if (tenantId !== undefined && event.tenant_id !== tenantId) {
      throw new BadRequestException('Contestant is out of tenant scope');
    }

    const unitPrice = Number(event.vote_price ?? 1);
    const totalAmount = Number((unitPrice * quantity).toFixed(2));
    const transactionToken = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    return {
      unitPrice,
      totalAmount,
      transactionToken,
    };
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: number, tenantId?: number): Promise<PaymentEntity> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: ['voter', 'event', 'category', 'contestant', 'votes', 'refunds', 'webhooks'],
    });
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    if (tenantId !== undefined && payment.event?.tenant_id !== tenantId) {
      throw new UnauthorizedException('Payment does not belong to authenticated tenant scope');
    }
    return payment;
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(tenantId?: number): Promise<any> {
    const baseQb = this.paymentsRepository.createQueryBuilder('payment');
    const completedQb = this.paymentsRepository.createQueryBuilder('payment');

    if (tenantId !== undefined) {
      baseQb
        .innerJoin(EventEntity, 'event_scope', 'event_scope.id = payment.event_id')
        .andWhere('event_scope.tenant_id = :tenantId', { tenantId });
      completedQb
        .innerJoin(EventEntity, 'event_scope', 'event_scope.id = payment.event_id')
        .andWhere('event_scope.tenant_id = :tenantId', { tenantId });
    }

    const totalPayments = await baseQb.getCount();
    const completedPayments = await completedQb
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getCount();
    const totalRevenue = await this.paymentsRepository
      .createQueryBuilder('payment')
      .innerJoin(
        tenantId !== undefined ? EventEntity : PaymentEntity,
        tenantId !== undefined ? 'event_scope' : 'payment_scope',
        tenantId !== undefined
          ? 'event_scope.id = payment.event_id'
          : 'payment_scope.id = payment.id',
      )
      .andWhere(tenantId !== undefined ? 'event_scope.tenant_id = :tenantId' : '1=1', { tenantId })
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .select('SUM(payment.amount)', 'total')
      .getRawOne();
    
    const providerBreakdown = await this.paymentsRepository
      .createQueryBuilder('payment')
      .innerJoin(EventEntity, 'event_scope', 'event_scope.id = payment.event_id')
      .select('payment.provider', 'provider')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(payment.amount)', 'total')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere(tenantId !== undefined ? 'event_scope.tenant_id = :tenantId' : '1=1', { tenantId })
      .groupBy('payment.provider')
      .getRawMany();
    
    return {
      totalPayments,
      completedPayments,
      totalRevenue: totalRevenue?.total || 0,
      providerBreakdown,
    };
  }

  /**
   * Get payout summary by contestant (total revenue per contestant)
   */
  async getPayoutSummary(
    page: number = 1,
    limit: number = 20,
    tenantId?: number,
  ): Promise<{ data: any[]; pagination: any }> {
    const qb = this.paymentsRepository
      .createQueryBuilder('payment')
      .select('payment.contestant_id', 'contestantId')
      .addSelect('contestant.name', 'contestantName')
      .addSelect('COUNT(payment.id)', 'paymentCount')
      .addSelect('SUM(payment.amount)', 'totalRevenue')
      .addSelect('SUM(payment.votes_purchased)', 'totalVotesPurchased')
      .innerJoin('payment.contestant', 'contestant')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('payment.contestant_id')
      .addGroupBy('contestant.name')
      .orderBy('totalRevenue', 'DESC');

    if (tenantId !== undefined) {
      qb.innerJoin(EventEntity, 'event_scope', 'event_scope.id = payment.event_id')
        .andWhere('event_scope.tenant_id = :tenantId', { tenantId });
    }

    const total = await qb.getCount();
    const pages = Math.ceil(total / limit);
    const data = await qb
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    return { data, pagination: { page, limit, total, pages } };
  }

  /**
   * Get revenue breakdown by provider
   */
  async getRevenueByProvider(tenantId?: number): Promise<any[]> {
    const qb = this.paymentsRepository
      .createQueryBuilder('payment')
      .select('payment.provider', 'provider')
      .addSelect('COUNT(payment.id)', 'paymentCount')
      .addSelect('SUM(payment.amount)', 'totalRevenue')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('payment.provider')
      .orderBy('totalRevenue', 'DESC');

    if (tenantId !== undefined) {
      qb.innerJoin(EventEntity, 'event_scope', 'event_scope.id = payment.event_id')
        .andWhere('event_scope.tenant_id = :tenantId', { tenantId });
    }

    return qb.getRawMany();
  }

  /**
   * Get revenue by period
   */
  async getRevenueByPeriod(startDate: string, endDate: string, tenantId?: number): Promise<any[]> {
    const qb = this.paymentsRepository
      .createQueryBuilder('payment')
      .select('DATE(payment.created_at)', 'date')
      .addSelect('SUM(payment.amount)', 'revenue')
      .addSelect('COUNT(*)', 'count')
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .andWhere('payment.created_at BETWEEN :start AND :end', {
        start: new Date(startDate),
        end: new Date(endDate),
      })
      .groupBy('DATE(payment.created_at)')
      .orderBy('date', 'ASC');

    if (tenantId !== undefined) {
      qb.innerJoin(EventEntity, 'event_scope', 'event_scope.id = payment.event_id')
        .andWhere('event_scope.tenant_id = :tenantId', { tenantId });
    }

    return qb.getRawMany();
  }

  /**
   * Handle webhook from payment provider
   */
  async handleWebhook(
    webhookDto: PaymentWebhookDto,
    signature?: string,
    rawBody?: string,
    headers?: Record<string, string | string[] | undefined>,
  ): Promise<{ success: boolean; message: string; votesCreated?: number; votesCredited?: number }> {
    const provider = webhookDto.provider as PaymentProvider;
    const event = webhookDto.data;
    
    try {
      const paymentId = await this.processWebhook(
        provider,
        event,
        signature,
        rawBody,
        headers,
      );
      
      // If payment confirmed, credit wallet (default) or auto-cast (legacy mode).
      if (paymentId) {
        const autoCast = String(this.configService.get('PAYMENT_WEBHOOK_AUTO_CAST') ?? 'false') === 'true';

        if (autoCast) {
          const votesCreated = await this.createVoteFromPayment(paymentId);
          return {
            success: true,
            message: 'Payment confirmed and votes created',
            votesCreated,
          };
        }

        const votesCredited = await this.creditWalletFromPayment(paymentId);
        return {
          success: true,
          message: 'Payment confirmed and wallet credited',
          votesCredited,
        };
      }
      
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }

  private async creditWalletFromPayment(paymentId: number): Promise<number> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const payment = await manager.findOne(PaymentEntity, {
        where: { id: paymentId },
        relations: ['event', 'category'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new BadRequestException('Payment not completed');
      }

      if (!payment.voter_id) {
        throw new BadRequestException('Payment has no voter attached');
      }

      const existingCredit = await manager.findOne(WalletVoteCreditEntity, {
        where: { payment_id: payment.id },
      });
      if (existingCredit) {
        await queryRunner.rollbackTransaction();
        return 0;
      }

      const totalPurchased = payment.votes_purchased || 1;
      let votesToCredit = totalPurchased;

      const category = await manager.findOne(CategoryEntity, {
        where: { id: payment.category_id },
      });

      if (category?.max_votes_per_user != null) {
        const totalUsed = await manager.count(VoteEntity, {
          where: {
            voter_id: payment.voter_id,
            event_id: payment.event_id,
            category_id: payment.category_id,
            status: In([VoteStatus.VALID, VoteStatus.PENDING]),
          },
        });
        const remainingByLimit = Math.max(0, category.max_votes_per_user - totalUsed);
        votesToCredit = Math.min(votesToCredit, remainingByLimit);
      }

      let wallet = await manager.findOne(VoteWalletEntity, {
        where: {
          user_id: payment.voter_id,
          event_id: payment.event_id,
          category_id: payment.category_id,
        },
      });

      if (!wallet) {
        wallet = manager.create(VoteWalletEntity, {
          user_id: payment.voter_id,
          event_id: payment.event_id,
          category_id: payment.category_id,
        });
      }

      wallet.paid_votes_purchased += votesToCredit;
      wallet.updated_at = new Date();
      const savedWallet = await manager.save(VoteWalletEntity, wallet);

      await manager.save(
        WalletVoteCreditEntity,
        manager.create(WalletVoteCreditEntity, {
          wallet_id: savedWallet.id,
          payment_id: payment.id,
          votes_credited: votesToCredit,
          votes_remaining: votesToCredit,
          amount: payment.amount,
        }),
      );

      payment.reconciled = true;
      payment.reconciliation_notes = `wallet_credited:${votesToCredit}/${totalPurchased}`;
      await manager.save(PaymentEntity, payment);

      await queryRunner.commitTransaction();

      return votesToCredit;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  async getWalletReconciliationByPayment(
    paymentId: number,
    page: number = 1,
    limit: number = 20,
    tenantId?: number,
  ): Promise<any> {
    const payment = await this.getPaymentById(paymentId, tenantId);

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    const wallet =
      payment.voter_id != null
        ? await this.voteWalletRepository.findOne({
            where: {
              user_id: payment.voter_id,
              event_id: payment.event_id,
              category_id: payment.category_id,
            },
          })
        : null;

    const linkedVotes = await this.votesRepository.find({
      where: { payment_id: payment.id },
      order: { created_at: 'DESC' },
      take: 200,
    });

    const creditRecord = await this.walletVoteCreditRepository.findOne({
      where: { payment_id: payment.id },
    });

    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));

    let walletDebits: VoteTransactionEntity[] = [];
    let walletDebitsTotal = 0;
    if (wallet) {
      [walletDebits, walletDebitsTotal] = await this.voteTransactionRepository.findAndCount({
        where: {
          wallet_id: wallet.id,
          vote_type: 'PAID',
        },
        order: { created_at: 'DESC' },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      });
    }

    const creditedVotes = creditRecord?.votes_credited ?? 0;
    const creditRemaining = creditRecord?.votes_remaining ?? 0;
    const consumedFromThisPayment = Math.max(0, creditedVotes - creditRemaining);
    const purchasedVotes = payment.votes_purchased || 0;

    return {
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        votesPurchased: purchasedVotes,
        reconciled: payment.reconciled,
        reconciliationNotes: payment.reconciliation_notes,
        completedAt: payment.completed_at,
        createdAt: payment.created_at,
        eventId: payment.event_id,
        categoryId: payment.category_id,
        contestantId: payment.contestant_id,
        voterId: payment.voter_id,
      },
      wallet: wallet
        ? {
            id: wallet.id,
            freeVoteUsed: wallet.free_vote_used,
            paidVotesPurchased: wallet.paid_votes_purchased,
            paidVotesUsed: wallet.paid_votes_used,
            remainingPaidVotes: Math.max(0, wallet.paid_votes_purchased - wallet.paid_votes_used),
            dailyPaidUsed: wallet.daily_paid_used,
            updatedAt: wallet.updated_at,
          }
        : null,
      reconciliation: {
        creditedVotes,
        creditRemaining,
        consumedFromThisPayment,
        purchasedVotes,
        directVotesLinkedToPayment: linkedVotes.length,
        walletPaidDebitsTotal: walletDebitsTotal,
        estimatedRemainingFromCredit: creditRemaining,
      },
      linkedVotes,
      walletPaidDebits: walletDebits,
      walletPaidDebitsPagination: {
        page: safePage,
        limit: safeLimit,
        total: walletDebitsTotal,
        pages: Math.ceil(walletDebitsTotal / safeLimit),
      },
    };
  }

  /**
   * Process webhook and return payment ID if confirmed
   */
  private async processWebhook(
    provider: PaymentProvider,
    event: any,
    signature?: string,
    rawBody?: string,
    headers?: Record<string, string | string[] | undefined>,
  ): Promise<number | null> {
    const isValid = await this.verifyWebhookSignature(
      provider,
      event,
      signature,
      rawBody,
      headers,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Idempotency: skip if already processed successfully
    if (signature) {
      const existing = await this.webhookRepository.findOne({
        where: { provider: provider as string, signature },
      });
      if (existing?.status === WebhookStatus.SUCCESS) return null;
    }

    // Extract payment ID from webhook data
    const paymentId = event.paymentId || event.payment_id || event.id;

    // Persist webhook record
    const newWebhook = new PaymentWebhookEntity();
    newWebhook.provider = provider as string;
    newWebhook.event_type = event.type || event.event_type || 'unknown';
    if (typeof paymentId === 'number') newWebhook.payment_id = paymentId;
    newWebhook.status = WebhookStatus.PROCESSING;
    newWebhook.webhook_payload = event;
    if (signature) newWebhook.signature = signature;
    const webhookRecord: PaymentWebhookEntity = await this.webhookRepository.save(newWebhook);

    try {
      let confirmedPaymentId: number | null = null;
      switch (provider) {
        case PaymentProvider.STRIPE:
          confirmedPaymentId = await this.handleStripeWebhook(event, paymentId);
          break;
        case PaymentProvider.PAYPAL:
          confirmedPaymentId = await this.handlePayPalWebhook(event, paymentId);
          break;
        case PaymentProvider.CHAPA:
          confirmedPaymentId = await this.handleChapaWebhook(event, paymentId);
          break;
        case PaymentProvider.TELEBIRR:
          confirmedPaymentId = await this.handleTelebirrWebhook(event, paymentId);
          break;
        case PaymentProvider.SANTIMPAY:
          confirmedPaymentId = await this.handleSantimPayWebhook(event, paymentId);
          break;
        case PaymentProvider.CRYPTO:
          confirmedPaymentId = await this.handleCryptoWebhook(event, paymentId);
          break;
        default:
          confirmedPaymentId = null;
      }
      await this.webhookRepository.update(webhookRecord.id, {
        status: WebhookStatus.SUCCESS,
        processed_at: new Date(),
      });
      return confirmedPaymentId;
    } catch (error) {
      await this.webhookRepository.update(webhookRecord.id, {
        status: WebhookStatus.FAILED,
        error_message: (error as Error).message,
        retry_count: (webhookRecord.retry_count || 0) + 1,
      });
      throw error;
    }
  }

  /**
   * Handle Stripe webhook - returns payment ID if successful
   */
  private async handleStripeWebhook(event: any, paymentId: number): Promise<number | null> {
    if (typeof paymentId !== 'number' || !paymentId) {
      return null;
    }
    await this.assertPaymentProvider(paymentId, PaymentProvider.STRIPE);
    const stripeEvent = event;
    
    // Check if payment succeeded
    if (stripeEvent.type === 'payment_intent.succeeded' || stripeEvent.type === 'checkout.session.completed') {
      await this.paymentsRepository.update(paymentId, {
        status: PaymentStatus.COMPLETED,
        provider_reference: stripeEvent.id,
        completed_at: new Date(),
      });
      return paymentId;
    }
    
    // Handle failed payment
    if (stripeEvent.type === 'payment_intent.payment_failed') {
      await this.paymentsRepository.update(paymentId, {
        status: PaymentStatus.FAILED,
        failure_reason: stripeEvent.data?.object?.last_payment_error?.message || 'Payment failed',
      });
    }
    
    return null;
  }

  /**
   * Handle PayPal webhook
   */
  private async handlePayPalWebhook(event: any, paymentId: number): Promise<number | null> {
    let resolvedId: number | undefined =
      typeof paymentId === 'number' && paymentId ? paymentId : undefined;

    if (!resolvedId) {
      const reference = String(
        event?.resource?.custom_id ??
          event?.resource?.invoice_id ??
          event?.resource?.supplementary_data?.related_ids?.order_id ??
          '',
      );
      if (reference) {
        const found = await this.paymentsRepository.findOne({
          where: { transaction_reference: reference, provider: PaymentProvider.PAYPAL },
        });
        resolvedId = found?.id;
      }
    }

    if (!resolvedId) {
      this.logger.warn(`PayPal webhook: cannot resolve payment - event_id=${event?.id}`);
      return null;
    }
    await this.assertPaymentProvider(resolvedId, PaymentProvider.PAYPAL);
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' || event.event_type === 'CHECKOUT.ORDER.APPROVED') {
      await this.paymentsRepository.update(resolvedId, {
        status: PaymentStatus.COMPLETED,
        provider_reference: event?.resource?.id ?? event.id,
        provider_tx_id: event?.resource?.id ?? undefined,
        completed_at: new Date(),
      });
      return resolvedId;
    }
    if (event.event_type === 'PAYMENT.CAPTURE.DENIED' || event.event_type === 'PAYMENT.CAPTURE.DECLINED') {
      await this.paymentsRepository.update(resolvedId, {
        status: PaymentStatus.FAILED,
        failure_reason: event?.summary ?? 'PayPal payment failed',
      });
    }
    return null;
  }

  /**
   * Handle Chapa webhook (Ethiopian payment gateway).
   *
   * Chapa sends a POST with event type `charge.success`, `charge.failed`, or `charge.cancelled`.
   * Real Chapa payloads do NOT include our internal payment ID — they include `tx_ref` which
   * we stored as `transaction_reference` when creating the session. We look that up first.
   * After receiving a success event we double-verify via the Chapa verify endpoint before
   * marking the payment as complete to prevent replay attacks.
   */
  private async handleChapaWebhook(event: any, paymentId: number): Promise<number | null> {
    const chapaEvent: string = event?.event ?? '';
    const status: string = event?.status ?? '';
    const reference: string = event?.reference ?? event?.tx_ref ?? '';

    // Real Chapa payloads carry tx_ref, not our internal payment ID — resolve it
    let resolvedId: number | undefined = typeof paymentId === 'number' && paymentId ? paymentId : undefined;
    if (!resolvedId) {
      const txRef: string = event?.tx_ref ?? '';
      if (txRef) {
        const found = await this.paymentsRepository.findOne({
          where: { transaction_reference: txRef },
        });
        resolvedId = found?.id;
      }
    }
    if (!resolvedId) {
      this.logger.warn(`Chapa webhook: cannot resolve payment — tx_ref=${event?.tx_ref}`);
      return null;
    }
    await this.assertPaymentProvider(resolvedId, PaymentProvider.CHAPA);

    // Successful payment — double-verify via Chapa API
    if (
      chapaEvent === 'charge.success' ||
      status === 'success' ||
      status === 'completed'
    ) {
      // Use tx_ref from the event payload for verification
      const txRef: string = event?.tx_ref ?? reference;
      if (txRef) {
        try {
          const verified = await this.chapaService.verifyTransaction(txRef);
          if (verified?.status !== 'success') {
            this.logger.warn(
              `Chapa double-verify failed for tx_ref=${txRef}, status=${verified?.status}`,
            );
            return null;
          }
        } catch (err) {
          this.logger.warn(`Chapa verify API call failed: ${(err as Error).message}`);
          // Proceed conservatively — do not mark as complete if verification fails
          return null;
        }
      }

      await this.paymentsRepository.update(resolvedId, {
        status: PaymentStatus.COMPLETED,
        provider_reference: reference || txRef,
        completed_at: new Date(),
        verification_status: 'verified' as any,
        verified_at: new Date(),
        webhook_signature_valid: true,
      });
      this.logger.log(`Chapa payment ${resolvedId} confirmed — ref: ${reference || txRef}`);
      return resolvedId;
    }

    if (
      chapaEvent === 'charge.failed' ||
      chapaEvent === 'charge.cancelled' ||
      status === 'failed' ||
      status === 'cancelled'
    ) {
      await this.paymentsRepository.update(resolvedId, {
        status: chapaEvent === 'charge.cancelled' || status === 'cancelled'
          ? PaymentStatus.CANCELLED
          : PaymentStatus.FAILED,
        failure_reason: event?.message ?? 'Payment failed via Chapa',
      });
    }

    return null;
  }

  /**
   * Handle Telebirr webhook (Ethiopian mobile money).
   *
   * Telebirr sends trade_status values: Completed, Paying, Pending, Expired, Failure.
   * Also used: PAY_SUCCESS (query order response).
   * The webhook payload is RSA-signed — we verify the signature before acting.
   */
  private async handleTelebirrWebhook(event: any, paymentId: number): Promise<number | null> {
    // trade_status comes from the notify payload; may also be status (older format)
    const tradeStatus: string = event?.trade_status ?? event?.status ?? '';
    const transactionId: string =
      event?.trans_id ?? event?.payment_order_id ?? event?.transactionId ?? '';

    // Real Telebirr payloads carry merch_order_id, not our internal payment ID — resolve it
    let resolvedId: number | undefined = typeof paymentId === 'number' && paymentId ? paymentId : undefined;
    if (!resolvedId) {
      const merchOrderId: string = event?.merch_order_id ?? '';
      if (merchOrderId) {
        const found = await this.paymentsRepository.findOne({
          where: { transaction_reference: merchOrderId },
        });
        resolvedId = found?.id;
      }
    }
    if (!resolvedId) {
      this.logger.warn(`Telebirr webhook: cannot resolve payment — merch_order_id=${event?.merch_order_id}`);
      return null;
    }
    await this.assertPaymentProvider(resolvedId, PaymentProvider.TELEBIRR);

    // Verify RSA signature on the webhook payload
    const signature: string = event?.sign ?? '';
    if (signature) {
      const signatureValid = this.telebirrService.verifyWebhookSignature(event, signature);
      if (!signatureValid) {
        this.logger.warn(`Telebirr webhook signature invalid for payment ${resolvedId}`);
        throw new UnauthorizedException('Telebirr webhook signature verification failed');
      }
    }

    if (
      tradeStatus === 'Completed' ||
      tradeStatus === 'PAY_SUCCESS' ||
      tradeStatus === 'SUCCESS'
    ) {
      await this.paymentsRepository.update(resolvedId, {
        status: PaymentStatus.COMPLETED,
        provider_reference: transactionId,
        provider_tx_id: transactionId,
        completed_at: new Date(),
        verification_status: 'verified' as any,
        verified_at: new Date(),
        webhook_signature_valid: true,
      });
      this.logger.log(`Telebirr payment ${resolvedId} confirmed — txId: ${transactionId}`);
      return resolvedId;
    }

    if (
      tradeStatus === 'Failure' ||
      tradeStatus === 'PAY_FAILED' ||
      tradeStatus === 'FAILED'
    ) {
      await this.paymentsRepository.update(resolvedId, {
        status: PaymentStatus.FAILED,
        failure_reason: 'Telebirr payment failed',
      });
    }

    if (tradeStatus === 'Expired' || tradeStatus === 'ORDER_CLOSED') {
      await this.paymentsRepository.update(resolvedId, {
        status: PaymentStatus.CANCELLED,
        failure_reason: 'Telebirr order expired',
      });
    }

    return null;
  }

  /**
   * Handle SantimPay webhook
   */
  private async handleSantimPayWebhook(event: any, paymentId: number): Promise<number | null> {
    const status = String(
      event?.status ??
        event?.paymentStatus ??
        event?.transaction_status ??
        '',
    ).toLowerCase();

    const reference = String(
      event?.txnId ??
        event?.transactionId ??
        event?.tx_ref ??
        event?.id ??
        event?.orderId ??
        event?.merchantOrderId ??
        '',
    );

    let resolvedId: number | undefined =
      typeof paymentId === 'number' && paymentId ? paymentId : undefined;

    if (!resolvedId) {
      const lookupId = String(
        event?.id ??
          event?.orderId ??
          event?.merchantOrderId ??
          event?.reference ??
          '',
      );
      if (lookupId) {
        const found = await this.paymentsRepository.findOne({
          where: { transaction_reference: lookupId },
        });
        resolvedId = found?.id;
      }
    }

    if (!resolvedId) {
      this.logger.warn(`SantimPay webhook: cannot resolve payment - reference=${reference}`);
      return null;
    }
    await this.assertPaymentProvider(resolvedId, PaymentProvider.SANTIMPAY);

    const isSuccess = ['success', 'successful', 'completed', 'paid', 'approved'].includes(status);
    if (isSuccess) {
      await this.paymentsRepository.update(resolvedId, {
        status: PaymentStatus.COMPLETED,
        provider_reference: reference || undefined,
        provider_tx_id: reference || undefined,
        completed_at: new Date(),
        verification_status: 'verified' as any,
        verified_at: new Date(),
        webhook_signature_valid: true,
      });
      this.logger.log(`SantimPay payment ${resolvedId} confirmed - ref: ${reference}`);
      return resolvedId;
    }

    const isCancelled = ['cancelled', 'canceled', 'expired'].includes(status);
    const isFailed = ['failed', 'error', 'declined'].includes(status);
    if (isCancelled || isFailed) {
      await this.paymentsRepository.update(resolvedId, {
        status: isCancelled ? PaymentStatus.CANCELLED : PaymentStatus.FAILED,
        failure_reason:
          event?.message ??
          `SantimPay payment ${isCancelled ? 'cancelled' : 'failed'}`,
      });
    }

    return null;
  }

  /**
   * Handle Crypto webhook
   */
  private async handleCryptoWebhook(event: any, paymentId: number): Promise<number | null> {
    const { status, txHash } = event;

    // Crypto webhooks typically don't include our internal payment ID.
    // Fall back to looking up by transaction_reference (orderId / merchantOrderId / id).
    let resolvedId: number | undefined = paymentId || undefined;
    if (!resolvedId) {
      const externalRef: string =
        event?.reference ??
        event?.tx_ref ??
        event?.orderId ??
        event?.merchantOrderId ??
        event?.id ??
        '';
      if (externalRef) {
        const found = await this.paymentsRepository.findOne({
          where: { transaction_reference: externalRef },
        });
        resolvedId = found?.id;
      }
    }
    if (!resolvedId) return null;
    await this.assertPaymentProvider(resolvedId, PaymentProvider.CRYPTO);

    if (status === 'confirmed' || status === 'completed') {
      await this.paymentsRepository.update(resolvedId, {
        status: PaymentStatus.COMPLETED,
        provider_reference: txHash,
        provider_tx_id: txHash,
        verification_status: 'verified' as any,
        verified_at: new Date(),
        webhook_signature_valid: true,
        completed_at: new Date(),
      });
      return resolvedId;
    }

    return null;
  }

  /**
   * Create votes from confirmed payment — ATOMIC TRANSACTION
   * Payment status verification + vote creation + receipt + contestant update
   * all happen in a single database transaction per the architecture doc:
   * "Vote confirmation and payment update must occur in a single transaction."
   */
  async createVoteFromPayment(paymentId: number): Promise<number> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Re-read payment inside transaction with a lock to prevent double-processing
      const payment = await queryRunner.manager.findOne(PaymentEntity, {
        where: { id: paymentId },
        relations: ['event', 'category', 'contestant'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new BadRequestException('Payment not completed');
      }

      const voteQuantity = payment.votes_purchased || 1;
      let votesCreated = 0;

      for (let i = 0; i < voteQuantity; i++) {
        const vote = await this.createSingleVoteInTransaction(queryRunner, payment, i + 1);
        if (vote) {
          votesCreated++;
        }
      }

      await queryRunner.commitTransaction();
      return votesCreated;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Atomic vote creation failed for payment ${paymentId}: ${(error as Error).message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create a single vote within an existing transaction
   */
  private async createSingleVoteInTransaction(
    queryRunner: import('typeorm').QueryRunner,
    payment: PaymentEntity,
    voteNumber: number,
  ): Promise<VoteEntity | null> {
    const manager = queryRunner.manager;

    // ── Vote limit checks (paid path) ──────────────────────────────────────
    const [event, category] = await Promise.all([
      manager.findOne(EventEntity, { where: { id: payment.event_id } }),
      manager.findOne(CategoryEntity, { where: { id: payment.category_id } }),
    ]);

    if (!event) {
      this.logger.warn(`Paid vote #${voteNumber} blocked - event ${payment.event_id} not found`);
      return null;
    }
    if (!this.isEventAcceptingVotes(event)) {
      this.logger.warn(
        `Paid vote #${voteNumber} blocked - event ${payment.event_id} not accepting votes (status: ${event.status})`,
      );
      return null;
    }

    // 1. Event: absolute cap on total votes per authenticated user
    if (event?.max_votes_per_user != null && payment.voter_id) {
      const total = await manager.count(VoteEntity, {
        where: {
          voter_id: payment.voter_id,
          event_id: payment.event_id,
          status: In([VoteStatus.VALID, VoteStatus.PENDING]),
        },
      });
      if (total >= event.max_votes_per_user) {
        this.logger.warn(
          `Paid vote #${voteNumber} blocked — event limit (${event.max_votes_per_user}) reached for voter ${payment.voter_id}`,
        );
        return null;
      }
    }

    // 2. Category: absolute cap on total votes per authenticated user
    if (category?.max_votes_per_user != null && payment.voter_id) {
      const total = await manager.count(VoteEntity, {
        where: {
          voter_id: payment.voter_id,
          event_id: payment.event_id,
          category_id: payment.category_id,
          status: In([VoteStatus.VALID, VoteStatus.PENDING]),
        },
      });
      if (total >= category.max_votes_per_user) {
        this.logger.warn(
          `Paid vote #${voteNumber} blocked — category limit (${category.max_votes_per_user}) reached for voter ${payment.voter_id}`,
        );
        return null;
      }
    }

    // 3. Category: daily total votes for ALL users combined
    if (category?.daily_vote_limit != null) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const dailyTotal = await manager.count(VoteEntity, {
        where: {
          event_id: payment.event_id,
          category_id: payment.category_id,
          status: VoteStatus.VALID,
          created_at: MoreThan(since),
        },
      });
      if (dailyTotal >= category.daily_vote_limit) {
        this.logger.warn(
          `Paid vote #${voteNumber} blocked — category daily limit (${category.daily_vote_limit}) reached`,
        );
        return null;
      }
    }
    // ── End limit checks ───────────────────────────────────────────────────

    // Create vote within transaction
    const vote = manager.create(VoteEntity, {
      event_id: payment.event_id,
      category_id: payment.category_id,
      contestant_id: payment.contestant_id,
      voter_id: payment.voter_id,
      vote_type: VoteType.PAID,
      payment_id: payment.id,
      amount: payment.amount / (payment.votes_purchased || 1),
      status: VoteStatus.VALID,
      ip_address: payment.payer_ip,
      user_agent: payment.user_agent,
      payment_verified: true,
      voting_timestamp: new Date(),
    });

    const savedVote = await manager.save(VoteEntity, vote);

    // Generate receipt within transaction
    const receiptCode = this.generateReceiptCode(payment.event_id, savedVote.id, voteNumber);
    const voteHash = this.generateVoteHash(savedVote.id, payment.contestant_id, payment.event_id);

    const receipt = manager.create(VoteReceiptEntity, {
      event_id: payment.event_id,
      vote_id: savedVote.id,
      receipt_code: receiptCode,
      receipt_hash: voteHash,
      is_verified: true,
      verification_code: this.generateVerificationCode(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    await manager.save(VoteReceiptEntity, receipt);

    // Update contestant vote count within transaction
    const contestant = await manager.findOne(ContestantEntity, {
      where: { id: payment.contestant_id },
    });

    if (contestant) {
      contestant.vote_count += 1;
      contestant.paid_vote_count += 1;
      await manager.save(ContestantEntity, contestant);
    }

    return savedVote;
  }

  /**
   * Generate unique receipt code
   */
  private generateReceiptCode(eventId: number, voteId: number, voteNumber: number): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const hash = crypto
      .createHash('sha256')
      .update(`${eventId}-${voteId}-${voteNumber}-${timestamp}`)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();
    return `VOTE-${eventId}-${voteId}-${voteNumber}-${hash}`;
  }

  /**
   * Generate vote hash for verification
   */
  private generateVoteHash(voteId: number, contestantId: number, eventId: number): string {
    return crypto
      .createHash('sha256')
      .update(`${voteId}:${contestantId}:${eventId}:${Date.now()}`)
      .digest('hex');
  }

  /**
   * Generate verification code for receipt
   */
  private generateVerificationCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  private isEventAcceptingVotes(event: EventEntity): boolean {
    if (event.status !== EventStatus.ACTIVE) {
      return false;
    }

    const now = new Date();
    const votingStart = event.voting_start ? new Date(event.voting_start) : null;
    const votingEnd = event.voting_end ? new Date(event.voting_end) : null;

    if (votingStart && now < votingStart) {
      return false;
    }
    if (votingEnd && now > votingEnd) {
      return false;
    }
    return true;
  }

  /**
   * Verify a vote receipt
   */
  async verifyReceipt(receiptCode: string): Promise<{ valid: boolean; vote?: any; message: string }> {
    const receipt = await this.voteReceiptRepository.findOne({
      where: { receipt_code: receiptCode },
      relations: ['vote', 'vote.event', 'vote.contestant', 'vote.category'],
    });

    if (!receipt) {
      return { valid: false, message: 'Receipt not found' };
    }

    if (receipt.is_verified) {
      return { valid: true, vote: receipt.vote, message: 'Receipt already verified' };
    }

    // Verify the receipt hash
    const vote = receipt.vote;
    const expectedHash = this.generateVoteHash(vote.id, vote.contestant_id, vote.event_id);
    
    if (receipt.receipt_hash !== expectedHash) {
      return { valid: false, message: 'Invalid receipt hash' };
    }

    // Mark as verified
    receipt.is_verified = true;
    receipt.verification_code = this.generateVerificationCode();
    await this.voteReceiptRepository.save(receipt);

    return { valid: true, vote, message: 'Receipt verified successfully' };
  }

  /**
   * Get receipt by code
   */
  async getReceiptByCode(receiptCode: string): Promise<VoteReceiptEntity | null> {
    return this.voteReceiptRepository.findOne({
      where: { receipt_code: receiptCode },
      relations: ['vote', 'vote.event', 'vote.contestant', 'vote.category', 'vote.payment'],
    });
  }

  /**
   * Verify webhook signature — HMAC-SHA256 per provider, skipped in development
   */
  private async verifyWebhookSignature(
    provider: PaymentProvider,
    event: any,
    signature?: string,
    rawBody?: string,
    headers?: Record<string, string | string[] | undefined>,
  ): Promise<boolean> {
    const nodeEnv = String(this.configService.get('NODE_ENV') ?? '').toLowerCase();
    const isProduction = nodeEnv === 'production';
    const allowUnverified = String(
      this.configService.get('PAYMENT_ALLOW_UNVERIFIED_WEBHOOKS') ??
        (isProduction ? 'false' : 'true'),
    ).toLowerCase() === 'true';

    // Outside production, allow bypass only when explicitly enabled.
    if (!isProduction && allowUnverified) {
      return true;
    }

    const requiresSignature = [
      PaymentProvider.STRIPE,
      PaymentProvider.CHAPA,
      PaymentProvider.TELEBIRR,
      PaymentProvider.SANTIMPAY,
    ].includes(provider);
    const telebirrBodySignature = provider === PaymentProvider.TELEBIRR && !!event?.sign;
    if (requiresSignature && !signature && !telebirrBodySignature) {
      return false;
    }

    try {
      const payload = JSON.stringify(event);
      switch (provider) {
        case PaymentProvider.STRIPE: {
          const secret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
          if (!secret) return true;
          const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
          return `sha256=${hmac}` === signature;
        }
        case PaymentProvider.CHAPA: {
          if (!signature || !rawBody) return false;
          return this.chapaService.verifyWebhookSignature(rawBody, signature);
        }
        case PaymentProvider.TELEBIRR: {
          // Telebirr uses RSA-SHA256, not HMAC-SHA256. The correct RSA verification
          // runs inside handleTelebirrWebhook() via telebirrService.verifyWebhookSignature().
          // An HMAC check here would always fail against real Telebirr payloads.
          return true;
        }
        case PaymentProvider.SANTIMPAY: {
          if (!signature) return false;
          return this.santimPayService.verifyCallbackSignature(signature as string);
        }
        case PaymentProvider.PAYPAL:
          return this.verifyPayPalWebhookSignature(event, headers);
        case PaymentProvider.CRYPTO:
          return this.verifyCryptoWebhookSignature(rawBody, signature, headers);
        case PaymentProvider.MANUAL:
          // Fail-closed in hardened mode unless explicitly allowed via config.
          return allowUnverified;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  private async verifyPayPalWebhookSignature(
    event: any,
    headers?: Record<string, string | string[] | undefined>,
  ): Promise<boolean> {
    const webhookId = this.configService.get<string>('PAYPAL_WEBHOOK_ID');
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    if (!webhookId || !clientId || !clientSecret) {
      this.logger.warn('PayPal webhook verification skipped: missing PAYPAL_WEBHOOK_ID/CLIENT credentials');
      return false;
    }

    const transmissionId = this.getHeaderValue(headers, 'paypal-transmission-id');
    const transmissionTime = this.getHeaderValue(headers, 'paypal-transmission-time');
    const transmissionSig =
      this.getHeaderValue(headers, 'paypal-transmission-sig') ??
      this.getHeaderValue(headers, 'paypal-signature');
    const certUrl = this.getHeaderValue(headers, 'paypal-cert-url');
    const authAlgo = this.getHeaderValue(headers, 'paypal-auth-algo');
    if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
      return false;
    }

    const baseUrl = this.resolvePayPalBaseUrl();
    try {
      const tokenResponse = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/v1/oauth2/token`,
          'grant_type=client_credentials',
          {
            headers: {
              Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );
      const accessToken = tokenResponse?.data?.access_token as string | undefined;
      if (!accessToken) return false;

      const verifyResponse = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/v1/notifications/verify-webhook-signature`,
          {
            auth_algo: authAlgo,
            cert_url: certUrl,
            transmission_id: transmissionId,
            transmission_sig: transmissionSig,
            transmission_time: transmissionTime,
            webhook_id: webhookId,
            webhook_event: event,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const status = String(verifyResponse?.data?.verification_status ?? '').toUpperCase();
      return status === 'SUCCESS' || status === 'VERIFIED';
    } catch (error) {
      this.logger.warn(`PayPal webhook verification failed: ${(error as Error).message}`);
      return false;
    }
  }

  private resolvePayPalBaseUrl(): string {
    const configured = this.configService.get<string>('PAYPAL_API_BASE_URL');
    if (configured && configured.trim().length > 0) {
      return configured.trim().replace(/\/+$/, '');
    }
    const mode = String(this.configService.get<string>('PAYPAL_MODE') ?? 'sandbox').toLowerCase();
    return mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private verifyCryptoWebhookSignature(
    rawBody?: string,
    signature?: string,
    headers?: Record<string, string | string[] | undefined>,
  ): boolean {
    const secret = this.configService.get<string>('CRYPTO_WEBHOOK_SECRET');
    if (!secret) {
      return false;
    }
    if (!rawBody || !signature) {
      return false;
    }

    const timestampRaw =
      this.getHeaderValue(headers, 'x-crypto-timestamp') ??
      this.getHeaderValue(headers, 'crypto-timestamp') ??
      this.getHeaderValue(headers, 'x-timestamp');
    if (!timestampRaw) {
      return false;
    }

    const timestamp = Number(timestampRaw);
    if (!Number.isFinite(timestamp)) {
      return false;
    }

    const toleranceSeconds = Number(
      this.configService.get<string>('CRYPTO_WEBHOOK_TOLERANCE_SECONDS') ?? '300',
    );
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
      return false;
    }

    const signedPayload = `${timestamp}.${rawBody}`;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');
    const normalizedSig = this.normalizeHmacSignature(signature);
    if (!normalizedSig || normalizedSig.length !== expected.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(normalizedSig, 'utf8'),
    );
  }

  private normalizeHmacSignature(signature: string): string | null {
    const value = signature.trim();
    if (!value) {
      return null;
    }
    const stripped = value.toLowerCase().startsWith('sha256=')
      ? value.slice('sha256='.length)
      : value;
    return /^[a-fA-F0-9]+$/.test(stripped) ? stripped.toLowerCase() : null;
  }

  private getHeaderValue(
    headers: Record<string, string | string[] | undefined> | undefined,
    name: string,
  ): string | undefined {
    if (!headers) return undefined;
    const value = headers[name.toLowerCase()] ?? headers[name];
    if (Array.isArray(value)) {
      return value[0];
    }
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
  }

  /**
   * Initiate payment checkout
   */
  async initiatePayment(
    voterId: number,
    eventId: number,
    categoryId: number,
    contestantId: number,
    amount: number,
    voteQuantity: number,
    provider: PaymentProvider,
    currency?: string,
    cryptoNetwork?: string,
    tenantId?: number,
  ): Promise<{ paymentId: number; sessionId: string; redirectUrl: string }> {
    // Validate provider
    if (!Object.values(PaymentProvider).includes(provider)) {
      throw new BadRequestException('Invalid payment provider');
    }

    // Validate event/category/contestant integrity and amount server-side.
    const event = await this.eventsRepository.findOne({
      where: tenantId === undefined ? { id: eventId } : { id: eventId, tenant_id: tenantId },
      select: ['id', 'tenant_id', 'status', 'voting_start', 'voting_end', 'daily_spending_cap'],
    });
    if (!event) {
      throw new BadRequestException(
        tenantId === undefined ? 'Event not found' : 'Event not found in your tenant scope',
      );
    }
    if (!this.isEventAcceptingVotes(event as EventEntity)) {
      throw new BadRequestException('Event is not accepting votes');
    }
    if (tenantId === undefined) {
      this.logger.warn(`Payment initiated without tenant context for event ${eventId}`);
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId, event_id: eventId },
      select: ['id', 'event_id', 'voting_enabled', 'paid_voting', 'minimum_vote_amount'],
    });
    if (!category) {
      throw new BadRequestException('Category not found for this event');
    }
    if (!category.voting_enabled) {
      throw new BadRequestException('Voting is disabled for this category');
    }
    if (!category.paid_voting) {
      throw new BadRequestException('Paid voting is disabled for this category');
    }

    const contestant = await this.contestantsRepository.findOne({
      where: { id: contestantId, event_id: eventId, category_id: categoryId },
      select: ['id'],
    });
    if (!contestant) {
      throw new BadRequestException('Contestant not found for this event/category');
    }

    const minimumVoteAmount = Number(category.minimum_vote_amount ?? 0);
    const minimumTotal = minimumVoteAmount > 0 ? minimumVoteAmount * voteQuantity : 0;
    if (amount < minimumTotal) {
      throw new BadRequestException(
        `Amount is below minimum required total (${minimumTotal.toFixed(2)})`,
      );
    }

    const resolvedCryptoNetwork =
      provider === PaymentProvider.CRYPTO
        ? this.resolveCryptoNetwork(cryptoNetwork)
        : undefined;

    // Create payment record
    const payment = this.paymentsRepository.create({
      voter_id: voterId,
      event_id: eventId,
      category_id: categoryId,
      contestant_id: contestantId,
      amount: Number(amount),
      currency: currency ?? 'ETB',
      provider,
      payment_method: resolvedCryptoNetwork,
      status: PaymentStatus.PENDING,
      votes_purchased: voteQuantity,
      received_at: new Date(),
    });

    const savedPayment = await this.paymentsRepository.save(payment);

    // Delegate to provider-specific handler
    let sessionId: string;
    let redirectUrl: string;

    switch (provider) {
      case PaymentProvider.STRIPE:
        ({ sessionId, redirectUrl } = await this.createStripeSession(savedPayment));
        break;
      case PaymentProvider.PAYPAL:
        ({ sessionId, redirectUrl } = await this.createPayPalSession(savedPayment));
        break;
      case PaymentProvider.CHAPA:
        ({ sessionId, redirectUrl } = await this.createChapaSession(savedPayment));
        break;
      case PaymentProvider.TELEBIRR:
        ({ sessionId, redirectUrl } = await this.createTelebirrSession(savedPayment));
        break;
      case PaymentProvider.SANTIMPAY:
        ({ sessionId, redirectUrl } = await this.createSantimPaySession(savedPayment));
        break;
      case PaymentProvider.CRYPTO:
        ({ sessionId, redirectUrl } = await this.createCryptoSession(savedPayment, resolvedCryptoNetwork));
        break;
      case PaymentProvider.MANUAL:
        ({ sessionId, redirectUrl } = await this.createManualPaymentSession(savedPayment));
        break;
    }

    return {
      paymentId: savedPayment.id,
      sessionId,
      redirectUrl,
    };
  }

  /**
   * Create Stripe checkout session
   */
  private async createStripeSession(
    payment: PaymentEntity,
  ): Promise<{ sessionId: string; redirectUrl: string }> {
    return {
      sessionId: `stripe_${payment.id}_${Date.now()}`,
      redirectUrl: `https://checkout.stripe.com/pay/${payment.id}`,
    };
  }

  /**
   * Create PayPal checkout session
   */
  private async createPayPalSession(
    payment: PaymentEntity,
  ): Promise<{ sessionId: string; redirectUrl: string }> {
    const referenceId = `paypal_vote_${payment.id}_${Date.now()}`;
    await this.paymentsRepository.update(payment.id, {
      transaction_reference: referenceId,
    });
    return {
      sessionId: referenceId,
      redirectUrl: `https://www.paypal.com/checkoutnow?token=${referenceId}`,
    };
  }

  /**
   * Create Chapa checkout session
   * Calls POST https://api.chapa.co/v1/transaction/initialize and returns the hosted checkout URL.
   */
  private async createChapaSession(
    payment: PaymentEntity,
  ): Promise<{ sessionId: string; redirectUrl: string }> {
    const appUrl = this.configService.get<string>('API_URL') ?? 'http://localhost:3000';
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    const txRef = `vote_${payment.id}_${Date.now()}`;

    const result = await this.chapaService.initializeTransaction({
      amount: String(payment.amount),
      currency: payment.currency || 'ETB',
      tx_ref: txRef,
      email: payment.voter?.email ?? 'voter@votechain.com',
      phone_number: payment.voter?.phone_number ?? payment.voter?.phone ?? '0900000000',
      callback_url: `${appUrl}/api/v1/payments/webhook`,
      return_url: `${frontendUrl}/confirmation?tx_ref=${txRef}`,
      customization: {
        title: 'Vote Purchase',
        description: `${payment.votes_purchased} vote(s)`,
      },
    });

    // Persist the tx_ref so we can verify it later via webhook
    await this.paymentsRepository.update(payment.id, {
      transaction_reference: txRef,
    });

    this.logger.log(`Chapa session created for payment ${payment.id} — tx_ref: ${txRef}`);
    return { sessionId: txRef, redirectUrl: result.checkout_url };
  }

  /**
   * Create Telebirr checkout session.
   * Steps: getToken → createOrder (pre-order) → generateCheckoutUrl.
   */
  private async createTelebirrSession(
    payment: PaymentEntity,
  ): Promise<{ sessionId: string; redirectUrl: string }> {
    const appUrl = this.configService.get<string>('API_URL') ?? 'http://localhost:3000';
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    const merchOrderId = `vote_${payment.id}_${Date.now()}`;

    const { prepay_id } = await this.telebirrService.createOrder({
      merch_order_id: merchOrderId,
      title: 'Vote Purchase',
      total_amount: String(payment.amount),
      trans_currency: payment.currency || 'ETB',
      notify_url: `${appUrl}/api/v1/payments/webhook`,
      redirect_url: `${frontendUrl}/confirmation?order_id=${merchOrderId}`,
    });

    const checkoutUrl = this.telebirrService.generateCheckoutUrl(prepay_id, merchOrderId);

    // Persist the merch_order_id so the webhook handler can look up this payment
    await this.paymentsRepository.update(payment.id, {
      transaction_reference: merchOrderId,
    });

    this.logger.log(`Telebirr session created for payment ${payment.id} — order: ${merchOrderId}`);
    return { sessionId: merchOrderId, redirectUrl: checkoutUrl };
  }

  /**
   * Create SantimPay checkout session
   */
  private async createSantimPaySession(
    payment: PaymentEntity,
  ): Promise<{ sessionId: string; redirectUrl: string }> {
    const appUrl = this.configService.get<string>('API_URL') ?? 'http://localhost:3000';
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    const referenceId = `santi_vote_${payment.id}_${Date.now()}`;

    const result = await this.santimPayService.initiatePayment({
      id: referenceId,
      amount: String(payment.amount),
      reason: `${payment.votes_purchased} vote(s) purchase`,
      notifyUrl: `${appUrl}/api/v1/payments/webhook`,
      successRedirectUrl: `${frontendUrl}/confirmation?provider=santimpay&ref=${referenceId}`,
      failureRedirectUrl: `${frontendUrl}/payment-failed?provider=santimpay&ref=${referenceId}`,
      cancelRedirectUrl: `${frontendUrl}/payment-cancelled?provider=santimpay&ref=${referenceId}`,
      phoneNumber: payment.voter?.phone_number ?? payment.voter?.phone,
    });

    await this.paymentsRepository.update(payment.id, {
      transaction_reference: referenceId,
    });

    this.logger.log(`SantimPay session created for payment ${payment.id} - ref: ${referenceId}`);
    return { sessionId: referenceId, redirectUrl: result.checkout_url };
  }

  /**
   * Create cryptocurrency payment session
   */
  private async createCryptoSession(
    payment: PaymentEntity,
    network?: string,
  ): Promise<{ sessionId: string; redirectUrl: string }> {
    const resolvedNetwork = this.resolveCryptoNetwork(network ?? payment.payment_method);
    const referenceId = `crypto_vote_${payment.id}_${Date.now()}`;
    await this.paymentsRepository.update(payment.id, {
      transaction_reference: referenceId,
      payment_method: resolvedNetwork,
    });
    return {
      sessionId: `${resolvedNetwork}_${referenceId}`,
      redirectUrl: `https://votechain.com/crypto-payment/${referenceId}?network=${encodeURIComponent(
        resolvedNetwork,
      )}`,
    };
  }

  private resolveCryptoNetwork(requested?: string): 'ethereum' | 'bitcoin' | 'solana' {
    const allowed = ['ethereum', 'bitcoin', 'solana'] as const;
    const fallback = String(this.configService.get<string>('CRYPTO_NETWORK') ?? 'ethereum').toLowerCase();
    const normalized = String(requested ?? fallback).toLowerCase();
    if ((allowed as readonly string[]).includes(normalized)) {
      return normalized as 'ethereum' | 'bitcoin' | 'solana';
    }
    throw new BadRequestException('Unsupported crypto network. Allowed: ethereum, bitcoin, solana');
  }

  /**
   * Create manual payment session
   */
  private async createManualPaymentSession(
    payment: PaymentEntity,
  ): Promise<{ sessionId: string; redirectUrl: string }> {
    return {
      sessionId: `manual_${payment.id}_${Date.now()}`,
      redirectUrl: `https://votechain.com/manual-payment/${payment.id}`,
    };
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: number,
    status: PaymentStatus,
    transactionId?: string,
  ): Promise<PaymentEntity> {
    const payment = await this.getPaymentById(paymentId);
    payment.status = status;
    if (transactionId) {
      payment.provider_tx_id = transactionId;
    }
    payment.updated_at = new Date();
    return this.paymentsRepository.save(payment);
  }

  /**
   * Process refund — creates RefundRequestEntity, invalidates votes, decrements contestant counts
   */
  async processRefund(
    paymentId: number,
    refundDto: ProcessRefundDto,
    adminId?: number,
    tenantId?: number,
  ): Promise<PaymentEntity> {
    const payment = await this.getPaymentById(paymentId, tenantId);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    const refundAmount = refundDto.amount || payment.amount;

    // 1. Create refund request record
    const refundRecord = new RefundRequestEntity();
    refundRecord.payment_id = payment.id;
    refundRecord.user_id = adminId || payment.voter_id;
    refundRecord.refund_amount = refundAmount;
    refundRecord.reason = refundDto.reason;
    refundRecord.status = RefundStatus.PROCESSED;
    if (adminId) {
      refundRecord.approved_by_user_id = adminId;
      refundRecord.approved_at = new Date();
    }
    refundRecord.processed_at = new Date();
    await this.refundRepository.save(refundRecord);

    // 2. Invalidate associated votes and decrement contestant counts
    const votes = await this.votesRepository.find({
      where: { payment_id: payment.id, status: VoteStatus.VALID },
    });
    for (const vote of votes) {
      vote.status = VoteStatus.INVALID;
      await this.votesRepository.save(vote);

      const contestant = await this.contestantsRepository.findOne({
        where: { id: vote.contestant_id },
      });
      if (contestant) {
        contestant.vote_count = Math.max(0, contestant.vote_count - 1);
        contestant.paid_vote_count = Math.max(0, contestant.paid_vote_count - 1);
        await this.contestantsRepository.save(contestant);
      }
    }

    // 3. Update payment
    payment.status = PaymentStatus.REFUNDED;
    payment.updated_at = new Date();
    return this.paymentsRepository.save(payment);
  }

  private async assertPaymentProvider(paymentId: number, provider: PaymentProvider): Promise<void> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      select: ['id', 'provider'],
    });
    if (!payment) {
      throw new BadRequestException('Payment not found');
    }
    if (payment.provider !== provider) {
      throw new UnauthorizedException('Webhook provider does not match payment provider');
    }
  }
}
