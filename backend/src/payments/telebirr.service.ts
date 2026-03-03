import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

// ─── DTOs ─────────────────────────────────────────────────────────────────

export interface TelebirrOrderParams {
  merch_order_id: string;
  title: string;
  total_amount: string;         // e.g. "100.00"
  trans_currency: string;       // e.g. "ETB"
  notify_url: string;           // webhook callback
  redirect_url: string;         // where to send the user after payment
  timeout_express?: string;     // order expiry in minutes, default "120"
  business_type?: string;       // e.g. "BuyGoods"
  trade_type?: string;          // "InApp" | "MiniApp" | "Web"
}

export interface TelebirrOrderResult {
  prepay_id: string;
  merch_order_id: string;
}

export type TelebirrTradeStatus =
  | 'PAY_SUCCESS'
  | 'PAY_FAILED'
  | 'WAIT_PAY'
  | 'ORDER_CLOSED'
  | 'PAYING'
  | 'ACCEPTED'
  | 'REFUNDING'
  | 'REFUND_SUCCESS'
  | 'REFUND_FAILED';

// ─── Service ──────────────────────────────────────────────────────────────

/**
 * TelebirrService
 *
 * Implements the Telebirr payment integration according to the official guide:
 *   Step 1: Apply Fabric Token  (POST /payment/v1/token)
 *   Step 2: Create Order        (POST /payment/v1/merchant/preOrder)
 *   Step 3: Generate checkout URL
 *   Step 5: Query Order         (POST /payment/v1/merchant/queryOrder)
 *   Step 7: Webhook notify handling (verifyWebhookSignature)
 *   Step 8: Refund              (POST /payment/v1/merchant/refund)
 *
 * All requests signed with SHA256WithRSA using TELEBIRR_PRIVATE_KEY.
 * Token is cached in memory and refreshed 5 minutes before expiry.
 */
@Injectable()
export class TelebirrService {
  private readonly logger = new Logger(TelebirrService.name);

  // ── Token cache ──────────────────────────────────────────────────────────
  private cachedToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Public API ──────────────────────────────────────────────────────────

  /**
   * Obtain (or return cached) Fabric token.
   * Caches until 5 minutes before expiry.
   */
  async getToken(): Promise<string> {
    const now = new Date();
    const refreshBuffer = 5 * 60 * 1000; // 5 minutes in ms

    if (
      this.cachedToken &&
      this.tokenExpiresAt &&
      this.tokenExpiresAt.getTime() - now.getTime() > refreshBuffer
    ) {
      return this.cachedToken;
    }

    const baseUrl = this.getBaseUrl();
    const xAppKey = this.getRequired('TELEBIRR_X_APP_KEY');
    const appSecret = this.getRequired('TELEBIRR_APP_SECRET');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/payment/v1/token`,
          { appSecret },
          { headers: { 'X-APP-Key': xAppKey, 'Content-Type': 'application/json' } },
        ),
      );

      const body = response.data;
      if (!body?.token) {
        throw new BadRequestException(
          `Telebirr token request failed: ${JSON.stringify(body)}`,
        );
      }

      this.cachedToken = body.token as string;
      // expirationDate is an ISO string from the API
      this.tokenExpiresAt = body.expirationDate
        ? new Date(body.expirationDate as string)
        : new Date(Date.now() + 10 * 60 * 60 * 1000); // fallback: 10 h

      this.logger.debug(`Telebirr token refreshed, expires at ${this.tokenExpiresAt.toISOString()}`);
      return this.cachedToken;
    } catch (error: any) {
      const msg = error?.response?.data ?? (error as Error).message;
      this.logger.error(`Telebirr getToken error: ${JSON.stringify(msg)}`);
      throw new BadRequestException('Telebirr token acquisition failed');
    }
  }

  /**
   * Create a pre-order and return the prepay_id needed to build the checkout URL.
   */
  async createOrder(params: TelebirrOrderParams): Promise<TelebirrOrderResult> {
    const token = await this.getToken();
    const baseUrl = this.getBaseUrl();
    const appId = this.getRequired('TELEBIRR_APP_ID');
    const merchCode = this.getRequired('TELEBIRR_MERCH_CODE');

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce_str = crypto.randomBytes(16).toString('hex');

    const bizContent = {
      notify_url: params.notify_url,
      redirect_url: params.redirect_url,
      appid: appId,
      merch_code: merchCode,
      merch_order_id: params.merch_order_id,
      trade_type: params.trade_type ?? 'Web',
      title: params.title,
      total_amount: params.total_amount,
      trans_currency: params.trans_currency,
      timeout_express: params.timeout_express ?? '120',
      business_type: params.business_type ?? 'BuyGoods',
    };

    // Top-level fields that go into the signature (excluding biz_content)
    const signFields: Record<string, string> = {
      appid: appId,
      merch_code: merchCode,
      nonce_str,
      timestamp,
      version: '1.0',
    };

    const signature = this.signRequest(signFields);

    const requestBody = {
      ...signFields,
      sign_type: 'SHA256WithRSA',
      sign: signature,
      biz_content: bizContent,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/payment/v1/merchant/preOrder`,
          requestBody,
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const data = response.data;
      const biz = data?.biz_content;

      if (!biz?.prepay_id) {
        throw new BadRequestException(
          `Telebirr createOrder failed: ${data?.msg ?? JSON.stringify(data)}`,
        );
      }

      return {
        prepay_id: biz.prepay_id as string,
        merch_order_id: biz.merch_order_id ?? params.merch_order_id,
      };
    } catch (error: any) {
      const msg = error?.response?.data ?? (error as Error).message;
      this.logger.error(`Telebirr createOrder error: ${JSON.stringify(msg)}`);
      throw new BadRequestException('Telebirr order creation failed');
    }
  }

  /**
   * Build the hosted checkout URL from a prepay_id.
   * The raw_request string is signed using the same RSA key.
   */
  generateCheckoutUrl(prepayId: string, merchOrderId: string): string {
    const webBaseUrl = this.getRequired('TELEBIRR_WEB_BASE_URL');
    const appId = this.getRequired('TELEBIRR_APP_ID');
    const merchCode = this.getRequired('TELEBIRR_MERCH_CODE');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce_str = crypto.randomBytes(16).toString('hex');

    const params: Record<string, string> = {
      appid: appId,
      merch_code: merchCode,
      merch_order_id: merchOrderId,
      nonce_str,
      prepay_id: prepayId,
      timestamp,
    };

    // Sort alphabetically, build key=value string, sign
    const sign = this.signRequest(params);

    // Assemble raw_request: sorted params + sign
    const rawRequest = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&') + `&sign=${encodeURIComponent(sign)}&sign_type=SHA256WithRSA`;

    return `${webBaseUrl}?${rawRequest}`;
  }

  /**
   * Query the current status of an order.
   * Useful as a fallback when webhooks are missed.
   */
  async queryOrder(
    merchOrderId: string,
  ): Promise<{ trade_status: TelebirrTradeStatus; [key: string]: any }> {
    const token = await this.getToken();
    const baseUrl = this.getBaseUrl();
    const appId = this.getRequired('TELEBIRR_APP_ID');
    const merchCode = this.getRequired('TELEBIRR_MERCH_CODE');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce_str = crypto.randomBytes(16).toString('hex');

    const signFields: Record<string, string> = {
      appid: appId,
      merch_code: merchCode,
      merch_order_id: merchOrderId,
      nonce_str,
      timestamp,
      version: '1.0',
    };

    const signature = this.signRequest(signFields);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/payment/v1/merchant/queryOrder`,
          {
            ...signFields,
            sign_type: 'SHA256WithRSA',
            sign: signature,
          },
          {
            headers: {
              Authorization: token,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data?.biz_content ?? response.data;
    } catch (error: any) {
      const msg = error?.response?.data ?? (error as Error).message;
      this.logger.error(`Telebirr queryOrder error: ${JSON.stringify(msg)}`);
      throw new BadRequestException('Telebirr order query failed');
    }
  }

  /**
   * Verify the RSA signature on an inbound webhook notification.
   *
   * Telebirr signs the webhook payload using its own private key.
   * We verify with TELEBIRR_PUBLIC_KEY (Telebirr's public key).
   *
   * @param payload   The webhook body object (will be stringified for verification).
   * @param signature The base64 signature from the webhook's `sign` field.
   */
  verifyWebhookSignature(payload: Record<string, any>, signature: string): boolean {
    const publicKey = this.configService.get<string>('TELEBIRR_PUBLIC_KEY');
    if (!publicKey) {
      this.logger.warn('TELEBIRR_PUBLIC_KEY not set — skipping signature check');
      return true;
    }

    try {
      // Build the canonical string the same way as signing (exclude sign/sign_type)
      const excluded = new Set(['sign', 'sign_type']);
      const canonicalString = Object.keys(payload)
        .filter((k) => !excluded.has(k) && payload[k] !== undefined && payload[k] !== null)
        .sort()
        .map((k) => `${k}=${payload[k]}`)
        .join('&');

      const formattedKey = this.formatPemKey(publicKey, 'PUBLIC');
      const verify = crypto.createVerify('SHA256');
      verify.update(canonicalString);
      return verify.verify(formattedKey, signature, 'base64');
    } catch (error) {
      this.logger.warn(`Telebirr webhook signature verification error: ${(error as Error).message}`);
      return false;
    }
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  /**
   * Sign a set of parameters with SHA256WithRSA using TELEBIRR_PRIVATE_KEY.
   *
   * Rules (from official docs / additional.md):
   *  1. Exclude: sign, sign_type, header, biz_content, raw_request
   *  2. Sort keys alphabetically
   *  3. Join as key=value&key=value
   *  4. Sign the resulting string with SHA256 + RSA private key
   *  5. Return base64-encoded signature
   */
  signRequest(params: Record<string, string>): string {
    const privateKey = this.configService.get<string>('TELEBIRR_PRIVATE_KEY');
    if (!privateKey) {
      throw new BadRequestException('TELEBIRR_PRIVATE_KEY is not configured');
    }

    const excluded = new Set(['sign', 'sign_type', 'header', 'biz_content', 'raw_request',
                               'wallet_reference_data', 'openType', 'refund_info']);

    const canonicalString = Object.keys(params)
      .filter((k) => !excluded.has(k) && params[k] !== undefined && params[k] !== '')
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&');

    const formattedKey = this.formatPemKey(privateKey, 'RSA PRIVATE');
    const sign = crypto.createSign('SHA256');
    sign.update(canonicalString);
    return sign.sign(formattedKey, 'base64');
  }

  /**
   * Normalise a PEM key that may have literal \n characters (from .env).
   * Adds header/footer if absent.
   */
  private formatPemKey(key: string, type: 'RSA PRIVATE' | 'PUBLIC'): string {
    // Replace literal \n with actual newlines
    let pem = key.replace(/\\n/g, '\n').trim();

    const header = `-----BEGIN ${type} KEY-----`;
    const footer = `-----END ${type} KEY-----`;

    if (!pem.includes(header)) {
      // Bare base64 — wrap it
      pem = `${header}\n${pem}\n${footer}`;
    }
    return pem;
  }

  private getBaseUrl(): string {
    return (
      this.configService.get<string>('TELEBIRR_BASE_URL') ??
      'https://developerportal.ethiotelebirr.et:38443/apiaccess/payment/gateway'
    );
  }

  private getRequired(key: string): string {
    const val = this.configService.get<string>(key);
    if (!val) {
      throw new BadRequestException(`${key} is not configured`);
    }
    return val;
  }
}
