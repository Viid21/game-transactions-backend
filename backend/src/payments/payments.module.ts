import { Module } from '@nestjs/common';
import { FakePaymentProvider } from './fake-payment.provider.js';
import { PAYMENT_PROVIDER } from './payment-provider.interface.js';

@Module({
  providers: [
    { provide: PAYMENT_PROVIDER, useClass: FakePaymentProvider },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentsModule {}
