import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { OrderService } from './orders.service.js';

const chain = (value: unknown) => ({ where: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(value) }) });

describe('OrderService', () => {
  it('creates a pending purchase from the server-side product price', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'order-1', providerOrderId: '123456789' });
    const prisma = {
      db: { orm: { public: {
        Product: chain({ id: 'coins', name: 'Coins', description: null, priceInCents: 199, currency: 'EUR' }),
        Player: chain({ id: 'player-1', steamId: '76561198000000001' }),
        Order: { create },
      } } },
    };
    const payment = { initiate: vi.fn().mockResolvedValue({ providerTransactionId: 'fake-txn-order-1', status: 'PENDING', authorizationUrl: 'fake-payment://authorize/order-1' }) };
    const transactions = { createTransaction: vi.fn() };
    const service = new OrderService(prisma as never, transactions as never, {} as never, payment as never);

    await expect(service.createPurchase('player-1', { productId: 'coins', quantity: 2 })).resolves.toEqual({
      orderId: 'order-1', status: 'PENDING', authorizationUrl: 'fake-payment://authorize/order-1',
    });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ amountInCents: 398, quantity: 2, status: 'PENDING' }));
    expect(payment.initiate).toHaveBeenCalledWith(expect.objectContaining({ steamId: '76561198000000001', orderId: '123456789' }));
    expect(transactions.createTransaction).toHaveBeenCalledWith(expect.objectContaining({ orderId: 'order-1' }));
  });

  it('rejects invalid quantities before creating an order', async () => {
    const service = new OrderService({} as never, {} as never, {} as never, {} as never);
    await expect(service.createPurchase('player-1', { productId: 'coins', quantity: 0 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('grants the purchased quantity only after payment is paid', async () => {
    const update = vi.fn();
    const order = { id: 'order-1', providerOrderId: '123456789', playerId: 'player-1', productId: 'coins', quantity: 3, status: 'PENDING' };
    const prisma = { db: { orm: { public: { Order: { ...chain(order), where: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(order), update }) } } } } };
    const inventory = { grant: vi.fn() };
    const transactions = { markOrderPaid: vi.fn() };
    const payment = { finalize: vi.fn().mockResolvedValue({ providerTransactionId: 'fake-txn-order-1', status: 'PAID' }) };
    const service = new OrderService(prisma as never, transactions as never, inventory as never, payment as never);

    await expect(service.confirmPurchase('player-1', 'order-1')).resolves.toEqual({ orderId: 'order-1', status: 'PAID' });
    expect(inventory.grant).toHaveBeenCalledWith('player-1', 'coins', 3);
    expect(transactions.markOrderPaid).toHaveBeenCalledWith('order-1', 'fake-txn-order-1');
    expect(payment.finalize).toHaveBeenCalledWith('123456789');
  });
});
