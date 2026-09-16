import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  FinalizePaymentResult,
  InitiatePaymentInput,
  InitiatePaymentResult,
  PaymentProvider,
} from './payment-provider.interface.js';

@Injectable()
export class FakePaymentProvider implements PaymentProvider {
  readonly name = 'FAKE' as const;
  private readonly payments = new Map<string, FinalizePaymentResult>();

  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (this.payments.has(input.orderId)) {
      const payment = this.payments.get(input.orderId)!;
      return { ...payment, status: 'PENDING', authorizationUrl: `fake-payment://authorize/${input.orderId}` };
    }

    const providerTransactionId = `fake-txn-${input.orderId}`;
    this.payments.set(input.orderId, { providerTransactionId, status: 'PENDING' });
    return {
      providerTransactionId,
      status: 'PENDING',
      authorizationUrl: `fake-payment://authorize/${input.orderId}`,
    };
  }

  async finalize(orderId: string): Promise<FinalizePaymentResult> {
    const payment = this.payments.get(orderId);
    if (!payment) throw new BadRequestException('Payment was not initiated');
    if (payment.status === 'PAID') return payment;

    const paid = { ...payment, status: 'PAID' as const };
    this.payments.set(orderId, paid);
    return paid;
  }

  async query(orderId: string): Promise<FinalizePaymentResult> {
    const payment = this.payments.get(orderId);
    if (!payment) throw new BadRequestException('Payment was not initiated');
    return payment;
  }
}
