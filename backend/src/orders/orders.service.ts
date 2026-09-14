import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { InventoryService } from '../inventories/inventories.service.js';
import { TransactionService } from '../transactions/transactions.service.js';
import { PAYMENT_PROVIDER, type PaymentProvider } from '../payments/payment-provider.interface.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import { randomInt } from 'node:crypto';

@Injectable()
export class OrderService {constructor(
    private readonly prismaService: PrismaService,
    private readonly transactionService: TransactionService,
    private readonly inventoryService: InventoryService,
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
      items: [{ sku: product.id, description: product.description ?? product.name, quantity: input.quantity, unitAmount: product.priceInCents }],
    });
    await this.transactionService.createTransaction({
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

    // Before production this must be a single database transaction with a unique payment constraint.
    await this.markOrderPaid(order.id);
    await this.inventoryService.grant(order.playerId, order.productId, order.quantity);
    await this.transactionService.markOrderPaid(order.id, payment.providerTransactionId);
    return { orderId: order.id, status: 'PAID' };
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

  private async markOrderPaid(id: string) {
    return this.prismaService.db.orm.public.Order   
      .where({ id })
      .update({ status: 'PAID' });
  }
}
