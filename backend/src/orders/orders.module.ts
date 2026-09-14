import { Module } from '@nestjs/common';
import { OrderService } from './orders.service.js';
import { OrderController } from './orders.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TransactionModule } from '../transactions/transactions.module.js';
import { InventoryModule } from '../inventories/inventories.module.js';
import { PaymentsModule } from '../payments/payments.module.js';

@Module({
  imports: [PrismaModule, TransactionModule, InventoryModule, PaymentsModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
