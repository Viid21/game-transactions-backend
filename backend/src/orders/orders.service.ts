import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class OrderService {constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async createOrder(data: any) {
    return this.prismaService.db.orm.public.Order.create(data);
  }

  async getAllOrders() {
    return this.prismaService.db.orm.public.Order.all();
  }

  async getOrderById(id: string) {
    return this.prismaService.db.orm.public.Order
      .where({ id })
      .first();
  }

  async updateOrder(id: string, data: any) {
    return this.prismaService.db.orm.public.Order   
      .where({ id })
      .update(data);
  }

  async deleteOrder(id: string) {
    return this.prismaService.db.orm.public.Order
      .where({ id })
      .delete();
  }
}