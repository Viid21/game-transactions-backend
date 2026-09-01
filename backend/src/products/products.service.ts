import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async createProduct(data: any) {
    return this.prismaService.db.orm.public.Product.create(data);
  }

  async getAllProducts() {
    return this.prismaService.db.orm.public.Product.all();
  }

  async getProductById(id: string) {
    return this.prismaService.db.orm.public.Product
      .where({ id })
      .first();
  }

  async updateProduct(id: string, data: any) {
    return this.prismaService.db.orm.public.Product
      .where({ id })
      .update(data);
  }

  async deleteProduct(id: string) {
    return this.prismaService.db.orm.public.Product
      .where({ id })
      .delete();
  }
}