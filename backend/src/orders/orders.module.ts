import { Module } from '@nestjs/common';
import { OrderService } from './orders.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [OrderService],
})
export class OrderModule {}
