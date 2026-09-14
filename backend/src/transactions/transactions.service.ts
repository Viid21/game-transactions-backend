import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TransactionService {constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async createTransaction(data: {
    orderId: string;
    provider: string;
    providerTransactionId: string;
    status: string;
  }) {
    return this.prismaService.db.orm.public.Transaction.create(data);
  }

  async markOrderPaid(orderId: string, providerTransactionId: string) {
    const transaction = await this.prismaService.db.orm.public.Transaction.where({ orderId }).first();
    if (!transaction) return null;
    return this.prismaService.db.orm.public.Transaction.where({ id: transaction.id }).update({
      status: 'PAID',
      providerTransactionId,
    });
  }
}
