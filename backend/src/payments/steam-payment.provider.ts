import { BadGatewayException, BadRequestException } from '@nestjs/common';
import type {
  FinalizePaymentResult,
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
} from './payment-provider.interface.js';

export interface SteamPaymentConfig {
  appId: string;
  publisherKey: string;
  sandbox: boolean;
  language: string;
}

interface SteamResponse {
  response?: {
    result?: string;
    params?: { transid?: string; steamurl?: string; status?: string };
    error?: { errordesc?: string };
  };
}

export class SteamPaymentProvider implements PaymentProvider {
  readonly name = 'STEAM' as const;
  constructor(private readonly config: SteamPaymentConfig) {}

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (!input.items.every((item) => /^\d+$/.test(item.sku))) {
      throw new BadRequestException('Steam payments require a numeric steamItemId for every product');
    }

    const body = new URLSearchParams({
      key: this.config.publisherKey,
      orderid: input.orderId,
      steamid: input.steamId,
      appid: this.config.appId,
      itemcount: String(input.items.length),
      language: this.config.language,
      currency: input.currency,
      usersession: 'client',
      format: 'json',
    });
    input.items.forEach((item, index) => {
      body.set(`itemid[${index}]`, item.sku);
      body.set(`qty[${index}]`, String(item.quantity));
      body.set(`amount[${index}]`, String(item.unitAmount * item.quantity));
      body.set(`description[${index}]`, item.description.slice(0, 128));
    });

    const response = await this.call('InitTxn/v3', { method: 'POST', body });
    const transactionId = response.params?.transid;
    if (!transactionId) throw new BadGatewayException('Steam did not return a transaction id');
    return { providerTransactionId: transactionId, status: 'PENDING', authorizationUrl: response.params?.steamurl };
  }

  async finalize(orderId: string): Promise<FinalizePaymentResult> {
    const response = await this.call('FinalizeTxn/v2', {
      method: 'POST',
      body: new URLSearchParams({ key: this.config.publisherKey, orderid: orderId, appid: this.config.appId, format: 'json' }),
    });
    return { providerTransactionId: response.params?.transid ?? orderId, status: 'PAID' };
  }

  async query(orderId: string): Promise<FinalizePaymentResult> {
    const query = new URLSearchParams({ key: this.config.publisherKey, orderid: orderId, appid: this.config.appId, format: 'json' });
    const response = await this.call(`QueryTxn/v3?${query}`, { method: 'GET' });
    const status = response.params?.status;
    return {
      providerTransactionId: response.params?.transid ?? orderId,
      status: status === 'Succeeded' ? 'PAID' : status === 'Failed' ? 'FAILED' : 'PENDING',
    };
  }

  private async call(path: string, init: RequestInit) {
    const interfaceName = this.config.sandbox ? 'ISteamMicroTxnSandbox' : 'ISteamMicroTxn';
    try {
      const response = await fetch(`https://partner.steam-api.com/${interfaceName}/${path}`, {
        ...init,
        signal: AbortSignal.timeout(10_000),
      });
      const payload = await response.json() as SteamResponse;
      if (!response.ok || payload.response?.result !== 'OK') {
        throw new BadGatewayException('Steam microtransaction request failed');
      }
      return payload.response;
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      throw new BadGatewayException('Steam microtransaction service is unavailable');
    }
  }
}
