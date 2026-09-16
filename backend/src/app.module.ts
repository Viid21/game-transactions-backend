import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ProductModule } from './products/products.module.js';
import { PlayerModule } from './players/players.module.js';
import { OrderModule } from './orders/orders.module.js';
import { InventoryModule } from './inventories/inventories.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [ProductModule, PlayerModule, OrderModule, InventoryModule, PrismaModule, AuthModule],
  controllers: [AppController],
})
export class AppModule {}
