import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class InventoryService {constructor(
    private readonly prismaService: PrismaService,
  ) {}

  private async createInventory(data: { playerId: string; productId: string; quantity: number }) {
    return this.prismaService.db.orm.public.Inventory.create(data);
  }

  async getPlayerInventory(playerId: string) {
    return this.prismaService.db.orm.public.Inventory.where({ playerId }).all();
  }

  async grant(playerId: string, productId: string, quantity: number) {
    const inventory = await this.prismaService.db.orm.public.Inventory
      .where({ playerId, productId })
      .first();
    if (!inventory) return this.createInventory({ playerId, productId, quantity });
    return this.prismaService.db.orm.public.Inventory
      .where({ playerId, productId })
      .update({ quantity: inventory.quantity + quantity });
  }
}
