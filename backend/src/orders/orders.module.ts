import { Module } from '@nestjs/common';
import { OrderService } from './orders.service.js';
import { OrderController } from './orders.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PaymentsModule } from '../payments/payments.module.js';

@Module({
  imports: [PrismaModule, PaymentsModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
