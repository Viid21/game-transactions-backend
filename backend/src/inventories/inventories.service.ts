import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class InventoryService {constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async getPlayerInventory(playerId: string) {
    return this.prismaService.db.orm.public.Inventory.where({ playerId }).all();
  }

}
