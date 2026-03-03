import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

export interface SantimPayInitParams {
  id: string;
  amount: string;
  reason: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
  notifyUrl: string;
  cancelRedirectUrl?: string;
  phoneNumber?: string;
}

export interface SantimPayInitResult {
  checkout_url: string;
  id: string;
  provider_reference?: string;
  raw?: any;
}

@Injectable()
export class SantimPayService {
  private readonly logger = new Logger(SantimPayService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('SANTIMPAY_BASE_URL') ??
      'https://services.santimpay.com/api/v1/gateway';
  }

  async initiatePayment(params: SantimPayInitParams): Promise<SantimPayInitResult> {
    const merchantId = this.getRequired('SANTIMPAY_MERCHANT_ID');
    const gatewayToken = this.getRequired('SANTIMPAY_GATEWAY_TOKEN');
    const privateKey = this.normalizePem(this.getRequired('SANTIMPAY_PRIVATE_KEY'));

    const amount = Number(params.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('SantimPay amount must be a positive number');
    }

    const signedToken = this.createSignedToken(
      {
        amount,
        paymentReason: params.reason,
        merchantId,
        generated: Math.floor(Date.now() / 1000),
      },
      privateKey,
    );

    const payload: Record<string, any> = {
      id: params.id,
      amount,
      reason: params.reason,
      merchantId,
      signedToken,
      successRedirectUrl: params.successRedirectUrl,
      failureRedirectUrl: params.failureRedirectUrl,
      notifyUrl: params.notifyUrl,
    };
    if (params.cancelRedirectUrl) payload.cancelRedirectUrl = params.cancelRedirectUrl;
    if (params.phoneNumber) payload.phoneNumber = params.phoneNumber;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/initiate-payment`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${gatewayToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const body = response.data;
      const data = body?.data ?? body;
      const checkoutUrl =
        data?.url ??
        data?.checkout_url ??
        data?.checkoutUrl ??
        body?.url ??
        body?.checkout_url ??
        body?.checkoutUrl;

      if (!checkoutUrl || typeof checkoutUrl !== 'string') {
        throw new BadRequestException(
          `SantimPay initialization failed: ${body?.message ?? 'Missing checkout URL'}`,
        );
      }

      return {
        checkout_url: checkoutUrl,
        id: params.id,
        provider_reference: data?.txnId ?? data?.transactionId ?? data?.id,
        raw: body,
      };
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? (error as Error).message;
      this.logger.error(`SantimPay initiatePayment error: ${msg}`);
      throw new BadRequestException(`SantimPay payment initialization failed: ${msg}`);
    }
  }

  verifyCallbackSignature(signedToken: string): boolean {
    const rawPublicKey = this.configService.get<string>('SANTIMPAY_PUBLIC_KEY');
    const publicKey = rawPublicKey ? this.normalizePem(rawPublicKey) : undefined;
    if (!publicKey) {
      const env = this.configService.get<string>('NODE_ENV');
      if (env === 'production') {
        this.logger.error('SANTIMPAY_PUBLIC_KEY is required in production');
        return false;
      }
      this.logger.warn('SANTIMPAY_PUBLIC_KEY not set - skipping SantimPay signature validation');
      return true;
    }

    try {
      const parts = String(signedToken ?? '').split('.');
      if (parts.length !== 3) return false;

      const [encodedHeader, encodedPayload, encodedSignature] = parts;
      const header = JSON.parse(
        Buffer.from(this.toBase64(encodedHeader), 'base64').toString('utf8'),
      );
      if (header?.alg !== 'ES256') {
        return false;
      }

      const payload = JSON.parse(
        Buffer.from(this.toBase64(encodedPayload), 'base64').toString('utf8'),
      ) as Record<string, any>;

      // Basic freshness guard if exp claim is present.
      if (typeof payload.exp === 'number' && Math.floor(Date.now() / 1000) > payload.exp) {
        return false;
      }

      const verified = crypto.verify(
        'sha256',
        Buffer.from(`${encodedHeader}.${encodedPayload}`),
        { key: publicKey, dsaEncoding: 'ieee-p1363' },
        Buffer.from(this.toBase64(encodedSignature), 'base64'),
      );
      return verified;
    } catch (error) {
      this.logger.warn(`SantimPay signature verification failed: ${(error as Error).message}`);
      return false;
    }
  }

  private createSignedToken(payload: Record<string, any>, privateKey: string): string {
    const header = { alg: 'ES256', typ: 'JWT' };
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const content = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto.sign(
      'sha256',
      Buffer.from(content),
      { key: privateKey, dsaEncoding: 'ieee-p1363' },
    );

    return `${content}.${this.base64UrlEncode(signature)}`;
  }

  private base64UrlEncode(value: string | Buffer): string {
    return Buffer.from(value)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private toBase64(base64url: string): string {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    return base64 + '='.repeat(padLength);
  }

  private getRequired(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) throw new BadRequestException(`${key} is not configured`);
    return value;
  }

  private normalizePem(pem: string): string {
    return pem.replace(/\\n/g, '\n').trim();
  }
}
