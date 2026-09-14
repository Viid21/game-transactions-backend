import { Module } from '@nestjs/common';
import { FakePaymentProvider } from './fake-payment.provider.js';
import { PAYMENT_PROVIDER } from './payment-provider.interface.js';
import { SteamPaymentProvider } from './steam-payment.provider.js';

@Module({
  providers: [
    {
      provide: PAYMENT_PROVIDER,
      useFactory: () => {
        if ((process.env.PAYMENT_PROVIDER ?? 'fake') === 'fake') return new FakePaymentProvider();
        if (process.env.PAYMENT_PROVIDER !== 'steam') throw new Error('PAYMENT_PROVIDER must be fake or steam');

        const publisherKey = process.env.STEAM_MICROTXN_KEY;
        const appId = process.env.STEAM_APP_ID;
        if (!publisherKey || !appId) throw new Error('STEAM_MICROTXN_KEY and STEAM_APP_ID are required for Steam payments');
        return new SteamPaymentProvider({
          publisherKey,
          appId,
          sandbox: process.env.STEAM_MICROTXN_SANDBOX !== 'false',
          language: process.env.STEAM_LANGUAGE ?? 'en',
        });
      },
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentsModule {}
