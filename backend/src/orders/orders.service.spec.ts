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
        Transaction: { create: vi.fn() },
      } } },
    };
    const payment = { initiate: vi.fn().mockResolvedValue({ providerTransactionId: 'fake-txn-order-1', status: 'PENDING', authorizationUrl: 'fake-payment://authorize/order-1' }) };
    const service = new OrderService(prisma as never, payment as never);

    await expect(service.createPurchase('player-1', { productId: 'coins', quantity: 2 })).resolves.toEqual({
      orderId: 'order-1', status: 'PENDING', authorizationUrl: 'fake-payment://authorize/order-1',
    });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ amountInCents: 398, quantity: 2, status: 'PENDING' }));
    expect(payment.initiate).toHaveBeenCalledWith(expect.objectContaining({ steamId: '76561198000000001', orderId: '123456789' }));
    expect(prisma.db.orm.public.Transaction.create).toHaveBeenCalledWith(expect.objectContaining({ orderId: 'order-1' }));
  });

  it('rejects invalid quantities before creating an order', async () => {
    const service = new OrderService({} as never, {} as never);
    await expect(service.createPurchase('player-1', { productId: 'coins', quantity: 0 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('grants the purchased quantity only after payment is paid', async () => {
    const updateOrder = vi.fn();
    const updateTransaction = vi.fn();
    const createInventory = vi.fn();
    const order = { id: 'order-1', providerOrderId: '123456789', playerId: 'player-1', productId: 'coins', quantity: 3, status: 'PENDING' };
    const orderModel = { where: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(order), update: updateOrder }) };
    const tx = { orm: { public: {
      Order: orderModel,
      Fulfillment: { create: vi.fn() },
      Transaction: { where: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue({ id: 'txn-1' }), update: updateTransaction }) },
      Inventory: { where: vi.fn().mockReturnValue({ first: vi.fn().mockResolvedValue(null), update: vi.fn() }), create: createInventory },
    } } };
    const prisma = { db: { orm: { public: { Order: orderModel } }, transaction: vi.fn(async (work) => work(tx)) } };
    const payment = { finalize: vi.fn().mockResolvedValue({ providerTransactionId: 'fake-txn-order-1', status: 'PAID' }) };
    const service = new OrderService(prisma as never, payment as never);

    await expect(service.confirmPurchase('player-1', 'order-1')).resolves.toEqual({ orderId: 'order-1', status: 'PAID' });
    expect(prisma.db.transaction).toHaveBeenCalledOnce();
    expect(tx.orm.public.Fulfillment.create).toHaveBeenCalledWith({ orderId: 'order-1' });
    expect(createInventory).toHaveBeenCalledWith({ playerId: 'player-1', productId: 'coins', quantity: 3 });
    expect(updateTransaction).toHaveBeenCalledWith({ status: 'PAID', providerTransactionId: 'fake-txn-order-1' });
    expect(payment.finalize).toHaveBeenCalledWith('123456789');
  });

  it('does not finalize or grant an already paid order again', async () => {
    const paidOrder = { id: 'order-1', providerOrderId: '123456789', playerId: 'player-1', status: 'PAID' };
    const prisma = { db: { orm: { public: { Order: chain(paidOrder) } } } };
    const payment = { finalize: vi.fn() };
    const service = new OrderService(prisma as never, payment as never);

    await expect(service.confirmPurchase('player-1', 'order-1')).resolves.toEqual({ orderId: 'order-1', status: 'PAID' });
    expect(payment.finalize).not.toHaveBeenCalled();
  });
});
