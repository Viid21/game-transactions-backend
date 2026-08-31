import { Module } from '@nestjs/common';
import { ProductController } from './products.controller.js';
import { ProductService } from './products.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}