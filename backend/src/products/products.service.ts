import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async getAllProducts() {
    return this.prismaService.db.orm.public.Product.all();
  }

  async getProductById(id: string) {
    return this.prismaService.db.orm.public.Product
      .where({ id })
      .first();
  }

}
