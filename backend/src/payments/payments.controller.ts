import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UserRole } from '@/entities/user.entity';
import {
  extractAuthenticatedTenantId,
  resolveTenantScope,
} from '@/common/helpers/tenant.helper';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, ProcessRefundDto, PaymentWebhookDto } from './dto/payment.dto';
import { CheckoutSessionDto } from './dto/checkout-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Get all payments with filtering
   * GET /api/v1/payments?page=1&limit=20&status=completed
   * Access: Admin
   */
  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllPayments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('provider') provider?: string,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const result = await this.paymentsService.getAllPayments(page, limit, status, provider, tenantId);
    return {
      statusCode: 200,
      message: 'Payments retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Confirm vote after payment (public)
   * POST /api/v1/payments/public/confirm
   * Access: Public — voter verifies receipt after redirect back
   */
  @Post('public/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmVote(@Body('receiptCode') receiptCode: string) {
    const result = await this.paymentsService.verifyReceipt(receiptCode);
    return {
      statusCode: 200,
      message: result.message,
      data: { valid: result.valid, vote: result.vote },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Admin payout summary by contestant
   * GET /api/v1/payments/admin/payouts
   * Access: Admin
   */
  @Get('admin/payouts')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPayoutSummary(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const result = await this.paymentsService.getPayoutSummary(page, limit, tenantId);
    return {
      statusCode: 200,
      message: 'Payout summary retrieved successfully',
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Media revenue summary
   * GET /api/v1/payments/media/revenue/summary
   * Access: Media (JWT)
   */
  @Get('media/revenue/summary')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.MEDIA, UserRole.ADMIN)
  async getMediaRevenueSummary(@Request() req: any) {
    const tenantId = extractAuthenticatedTenantId(req);
    const stats = await this.paymentsService.getPaymentStats(tenantId);
    return {
      statusCode: 200,
      message: 'Revenue summary retrieved',
      data: {
        totalPayments: stats.totalPayments,
        completedPayments: stats.completedPayments,
        totalRevenue: stats.totalRevenue,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Media revenue by period
   * GET /api/v1/payments/media/revenue/by-period?start=&end=
   * Access: Media (JWT)
   */
  @Get('media/revenue/by-period')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.MEDIA, UserRole.ADMIN)
  async getMediaRevenueByPeriod(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.paymentsService.getRevenueByPeriod(startDate, endDate, tenantId);
    return {
      statusCode: 200,
      message: 'Revenue by period retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Media revenue by provider
   * GET /api/v1/payments/media/revenue/by-provider
   * Access: Media (JWT)
   */
  @Get('media/revenue/by-provider')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.MEDIA, UserRole.ADMIN)
  async getMediaRevenueByProvider(@Request() req: any) {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.paymentsService.getRevenueByProvider(tenantId);
    return {
      statusCode: 200,
      message: 'Revenue by provider retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get payment by ID
   * GET /api/v1/payments/:id
   * Access: Admin, or owner
   */
  @Get(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPayment(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const payment = await this.paymentsService.getPaymentById(id, tenantId);
    return {
      statusCode: 200,
      message: 'Payment retrieved successfully',
      data: payment,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create new payment
   * POST /api/v1/payments
   * Access: Voter/Admin
   */
  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.VOTER, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const checkout = await this.paymentsService.createPayment(req.user.id, createPaymentDto, tenantId);
    return {
      statusCode: 201,
      message: 'Payment initialized successfully',
      data: checkout,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Frontend checkout-session compatibility endpoint
   * POST /api/v1/payments/checkout-session
   * Payload: { contestantId: string, quantity: number }
   * Response data: { unitPrice: number, totalAmount: number, transactionToken: string }
   */
  @Post('checkout-session')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.VOTER, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createCheckoutSession(
    @Body() body: CheckoutSessionDto,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const data = await this.paymentsService.createCheckoutSessionFromUi(
      req.user.id,
      body.contestantId,
      body.quantity,
      tenantId,
    );
    return {
      statusCode: 201,
      message: 'Checkout session created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process refund
   * POST /api/v1/payments/:id/refund
   * Access: Admin
   */
  @Post(':id/refund')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async processRefund(
    @Param('id', ParseIntPipe) id: number,
    @Body() refundDto: ProcessRefundDto,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const refund = await this.paymentsService.processRefund(id, refundDto, req.user.id, tenantId);
    return {
      statusCode: 200,
      message: 'Refund processed successfully',
      data: refund,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get payment statistics
   * GET /api/v1/payments/stats
   * Access: Admin
   */
  @Get('stats/summary')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPaymentStats(@Request() req: any) {
    const tenantId = extractAuthenticatedTenantId(req);
    const stats = await this.paymentsService.getPaymentStats(tenantId);
    return {
      statusCode: 200,
      message: 'Payment statistics retrieved successfully',
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get revenue by period
   * GET /api/v1/payments/revenue?start=2024-01-01&end=2024-12-31
   * Access: Admin
   */
  @Get('stats/revenue')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getRevenueByPeriod(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
    @Request() req: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const revenue = await this.paymentsService.getRevenueByPeriod(startDate, endDate, tenantId);
    return {
      statusCode: 200,
      message: 'Revenue data retrieved successfully',
      data: revenue,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Payment webhook (Stripe/PayPal/Chapa/Telebirr/SantimPay/Crypto)
   * POST /api/v1/payments/webhook
   * Access: Public (webhook from payment provider)
   * Note: No tenant validation needed — webhooks come from payment providers,
   * not tenant users. The payment is identified by reference/ID which is already event-scoped.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() webhookDto: PaymentWebhookDto,
    @Headers() headers: Record<string, string | string[] | undefined>,
    @Req() req: RawBodyRequest<ExpressRequest>,
  ) {
    const signature = this.resolveWebhookSignature(webhookDto.provider, headers);
    const rawBody =
      typeof req?.rawBody === 'string'
        ? req.rawBody
        : Buffer.isBuffer(req?.rawBody)
          ? req.rawBody.toString('utf8')
          : undefined;
    const result = await this.paymentsService.handleWebhook(
      webhookDto,
      signature,
      rawBody,
      headers,
    );
    return {
      statusCode: 200,
      message: 'Webhook processed',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get payment-to-wallet reconciliation view
   * GET /api/v1/payments/admin/reconciliation/:id?page=1&limit=20
   * Access: Admin
   */
  @Get('admin/reconciliation/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getWalletReconciliation(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Request() req?: any,
  ) {
    const tenantId = extractAuthenticatedTenantId(req);
    const safePage = this.parsePositiveInt(page, 1);
    const safeLimit = this.parsePositiveInt(limit, 20);
    const data = await this.paymentsService.getWalletReconciliationByPayment(
      id,
      safePage,
      safeLimit,
      tenantId,
    );

    return {
      statusCode: 200,
      message: 'Payment wallet reconciliation retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  private resolveWebhookSignature(
    provider: string,
    headers: Record<string, string | string[] | undefined>,
  ): string | undefined {
    const getHeader = (...names: string[]): string | undefined => {
      for (const name of names) {
        const value = headers?.[name.toLowerCase()] ?? headers?.[name];
        if (Array.isArray(value)) {
          if (value.length > 0 && value[0]) return value[0];
        } else if (typeof value === 'string' && value.trim().length > 0) {
          return value;
        }
      }
      return undefined;
    };

    const normalizedProvider = String(provider ?? '').toLowerCase();
    switch (normalizedProvider) {
      case 'stripe':
        return getHeader('stripe-signature');
      case 'paypal':
        return getHeader('paypal-transmission-sig');
      case 'chapa':
        return getHeader('chapa-signature', 'x-chapa-signature');
      case 'telebirr':
        return getHeader('telebirr-signature', 'x-telebirr-signature', 'x-signature');
      case 'santimpay':
        return getHeader('signed-token', 'x-signed-token');
      case 'crypto':
        return getHeader('x-crypto-signature', 'crypto-signature', 'x-signature');
      default:
        return getHeader(
          'stripe-signature',
          'paypal-transmission-sig',
          'chapa-signature',
          'x-chapa-signature',
          'telebirr-signature',
          'x-telebirr-signature',
          'x-signature',
          'signed-token',
          'x-signed-token',
          'x-crypto-signature',
          'crypto-signature',
        );
    }
  }

  private parsePositiveInt(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(1, Math.trunc(parsed));
  }
}
