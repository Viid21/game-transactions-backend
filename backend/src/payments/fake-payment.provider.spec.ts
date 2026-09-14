import { FakePaymentProvider } from './fake-payment.provider.js';

describe('FakePaymentProvider', () => {
  const input = { orderId: 'order-1', steamId: '76561198000000001', currency: 'EUR', items: [{ sku: 'coins', description: 'Coins', quantity: 1, unitAmount: 199 }] };

  it('creates a pending payment and finalizes it idempotently', async () => {
    const provider = new FakePaymentProvider();
    const initiated = await provider.initiate(input);
    expect(initiated.status).toBe('PENDING');
    expect(initiated.authorizationUrl).toBe('fake-payment://authorize/order-1');

    await expect(provider.finalize('missing')).rejects.toThrow('Payment was not initiated');
    expect((await provider.finalize(input.orderId)).status).toBe('PAID');
    expect(await provider.finalize(input.orderId)).toEqual(await provider.query(input.orderId));
  });
});
