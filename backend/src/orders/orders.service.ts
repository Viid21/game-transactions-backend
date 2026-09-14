import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PAYMENT_PROVIDER, type PaymentProvider } from '../payments/payment-provider.interface.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import { randomInt } from 'node:crypto';

@Injectable()
export class OrderService {constructor(
    private readonly prismaService: PrismaService,
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProvider,
  ) {}

  async createPurchase(playerId: string, input: CreateOrderDto) {
    if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 99) {
      throw new BadRequestException('quantity must be an integer between 1 and 99');
    }
    const product = await this.prismaService.db.orm.public.Product.where({ id: input.productId }).first();
    if (!product) throw new NotFoundException('Product not found');
    const player = await this.prismaService.db.orm.public.Player.where({ id: playerId }).first();
    if (!player?.steamId) throw new BadRequestException('Player has no Steam identity');

    const order = await this.createOrder({
      // Steam requires a unique unsigned 64-bit order id. Keep the UUID as our public/internal id.
      providerOrderId: (BigInt(Date.now()) * 1_000_000n + BigInt(randomInt(1_000_000))).toString(),
      playerId,
      productId: product.id,
      quantity: input.quantity,
      amountInCents: product.priceInCents * input.quantity,
      currency: product.currency,
      status: 'PENDING',
    });
    const payment = await this.paymentProvider.initiate({
      orderId: order.providerOrderId,
      steamId: player.steamId,
      currency: product.currency,
      items: [{ sku: product.steamItemId ?? product.id, description: product.description ?? product.name, quantity: input.quantity, unitAmount: product.priceInCents }],
    });
    await this.prismaService.db.orm.public.Transaction.create({
      orderId: order.id,
      provider: 'FAKE',
      providerTransactionId: payment.providerTransactionId,
      status: payment.status,
    });
    return { orderId: order.id, status: payment.status, authorizationUrl: payment.authorizationUrl };
  }

  async confirmPurchase(playerId: string, orderId: string) {
    const order = await this.getOwnedOrder(playerId, orderId);
    if (order.status === 'PAID') return { orderId: order.id, status: 'PAID' };

    const payment = await this.paymentProvider.finalize(order.providerOrderId);
    if (payment.status !== 'PAID') return { orderId: order.id, status: payment.status };

    try {
      return await this.prismaService.db.transaction(async (tx) => {
        const currentOrder = await tx.orm.public.Order.where({ id: order.id }).first();
        if (!currentOrder) throw new NotFoundException('Order not found');
        if (currentOrder.status === 'PAID') return { orderId: currentOrder.id, status: 'PAID' as const };

        // Its unique primary key is the durable idempotency claim for this order.
        await tx.orm.public.Fulfillment.create({ orderId: currentOrder.id });

        const transaction = await tx.orm.public.Transaction.where({ orderId: currentOrder.id }).first();
        if (!transaction) throw new Error('Payment transaction not found');

        const inventory = await tx.orm.public.Inventory
          .where({ playerId: currentOrder.playerId, productId: currentOrder.productId })
          .first();

        if (inventory) {
          await tx.orm.public.Inventory
            .where({ playerId: currentOrder.playerId, productId: currentOrder.productId })
            .update({ quantity: inventory.quantity + currentOrder.quantity });
        } else {
          await tx.orm.public.Inventory.create({
            playerId: currentOrder.playerId,
            productId: currentOrder.productId,
            quantity: currentOrder.quantity,
          });
        }

        await tx.orm.public.Transaction.where({ id: transaction.id }).update({
          status: 'PAID',
          providerTransactionId: payment.providerTransactionId,
        });
        await tx.orm.public.Order.where({ id: currentOrder.id }).update({ status: 'PAID' });
        return { orderId: currentOrder.id, status: 'PAID' as const };
      });
    } catch (error) {
      const latestOrder = await this.getOwnedOrder(playerId, orderId);
      if (latestOrder.status === 'PAID') return { orderId: latestOrder.id, status: 'PAID' as const };
      throw error;
    }
  }

  async getOwnedOrder(playerId: string, orderId: string) {
    const order = await this.getOrderById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (order.playerId !== playerId) throw new ForbiddenException();
    return order;
  }

  private async createOrder(data: {
    providerOrderId: string;
    playerId: string;
    productId: string;
    quantity: number;
    amountInCents: number;
    currency: string;
    status: string;
  }) {
    return this.prismaService.db.orm.public.Order.create(data);
  }

  private async getOrderById(id: string) {
    return this.prismaService.db.orm.public.Order
      .where({ id })
      .first();
  }

}
