import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

export interface ChapaInitParams {
  amount: string;
  currency: string;
  tx_ref: string;
  email: string;
  phone_number: string;
  callback_url: string;
  return_url: string;
  customization?: {
    title?: string;
    description?: string;
  };
}

export interface ChapaInitResult {
  checkout_url: string;
  tx_ref: string;
}

export interface ChapaVerifyResult {
  status: string;
  tx_ref: string;
  amount: string;
  currency: string;
  reference: string;
  payment_method?: string;
  [key: string]: any;
}

/**
 * ChapaService
 *
 * Wraps the Chapa REST API (https://api.chapa.co/v1).
 * Endpoints used:
 *  - POST /transaction/initialize  → get checkout_url
 *  - GET  /transaction/verify/:ref → confirm payment after webhook
 *  - PUT  /transaction/cancel/:ref → cancel an active transaction
 *
 * Authentication: Bearer token via CHAPA_SECRET_KEY env var.
 * Webhook verification: HMAC-SHA256 over raw request body using CHAPA_WEBHOOK_SECRET.
 */
@Injectable()
export class ChapaService {
  private readonly logger = new Logger(ChapaService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('CHAPA_BASE_URL') ??
      'https://api.chapa.co/v1';
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Initialize a Chapa transaction and return the hosted checkout URL.
   */
  async initializeTransaction(params: ChapaInitParams): Promise<ChapaInitResult> {
    const secretKey = this.getSecretKey();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/transaction/initialize`,
          {
            amount: params.amount,
            currency: params.currency,
            tx_ref: params.tx_ref,
            email: params.email,
            phone_number: params.phone_number,
            callback_url: params.callback_url,
            return_url: params.return_url,
            customization: params.customization,
          },
          {
            headers: {
              Authorization: `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const data = response.data;
      if (data.status !== 'success' || !data.data?.checkout_url) {
        throw new BadRequestException(
          `Chapa initialization failed: ${data.message ?? 'Unknown error'}`,
        );
      }

      return {
        checkout_url: data.data.checkout_url,
        tx_ref: params.tx_ref,
      };
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? (error as Error).message;
      this.logger.error(`Chapa initializeTransaction error: ${msg}`);
      throw new BadRequestException(`Chapa payment initialization failed: ${msg}`);
    }
  }

  /**
   * Verify a transaction by its tx_ref.
   * Call this after receiving a webhook to double-confirm the payment status.
   */
  async verifyTransaction(txRef: string): Promise<ChapaVerifyResult> {
    const secretKey = this.getSecretKey();

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/transaction/verify/${encodeURIComponent(txRef)}`,
          {
            headers: { Authorization: `Bearer ${secretKey}` },
          },
        ),
      );

      return response.data?.data ?? response.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? (error as Error).message;
      this.logger.error(`Chapa verifyTransaction error: ${msg}`);
      throw new BadRequestException(`Chapa verification failed: ${msg}`);
    }
  }

  /**
   * Cancel an active (not yet completed) transaction.
   */
  async cancelTransaction(txRef: string): Promise<void> {
    const secretKey = this.getSecretKey();

    try {
      await firstValueFrom(
        this.httpService.put(
          `${this.baseUrl}/transaction/cancel/${encodeURIComponent(txRef)}`,
          {},
          { headers: { Authorization: `Bearer ${secretKey}` } },
        ),
      );
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? (error as Error).message;
      this.logger.warn(`Chapa cancelTransaction error: ${msg}`);
    }
  }

  /**
   * Verify the HMAC-SHA256 signature sent by Chapa in the `chapa-signature` header.
   *
   * @param rawBody   The raw JSON string received in the webhook body.
   * @param signature The value of the `chapa-signature` (or `x-chapa-signature`) header.
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = this.configService.get<string>('CHAPA_WEBHOOK_SECRET');
    if (!secret) {
      this.logger.warn('CHAPA_WEBHOOK_SECRET not set — skipping signature check');
      return true;
    }
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex'),
    );
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private getSecretKey(): string {
    const key =
      this.configService.get<string>('CHAPA_SECRET_KEY') ??
      this.configService.get<string>('CHAPA_API_KEY');
    if (!key) {
      throw new BadRequestException('CHAPA_SECRET_KEY is not configured');
    }
    return key;
  }
}
