import { Module } from '@nestjs/common';
import { InventoryController } from './inventories.controller.js';
import { InventoryService } from './inventories.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
