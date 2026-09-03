import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class InventoryService {constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async createInventory(data: any) {
    return this.prismaService.db.orm.public.Inventory.create(data);
  }

  async getAllInventories() {
    return this.prismaService.db.orm.public.Inventory.all();
  }

  async getInventoryById(playerId: string) {
    return this.prismaService.db.orm.public.Inventory               
      .where({ playerId})
      .first();
  }

  async updateInventory(playerId: string, data: any) {
    return this.prismaService.db.orm.public.Inventory
      .where({ playerId })
      .update(data);
  }

  async deleteInventory(playerId: string) {
    return this.prismaService.db.orm.public.Inventory
      .where({ playerId })
      .delete();
  }
}