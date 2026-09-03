import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TransactionService {constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async createTransaction(data: any) {
    return this.prismaService.db.orm.public.Transaction.create(data);
  }

  async getAllTransactions() {
    return this.prismaService.db.orm.public.Transaction.all();
  }

  async getTransactionById(id: string) {
    return this.prismaService.db.orm.public.Transaction
      .where({ id })
      .first();
  }

  async updateTransaction(id: string, data: any) {
    return this.prismaService.db.orm.public.Transaction
      .where({ id })
      .update(data);
  }

  async deleteTransaction(id: string) {
    return this.prismaService.db.orm.public.Transaction
      .where({ id })
      .delete();
  }
}