import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PlayerService {constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async createPlayer(data: any) {
    return this.prismaService.db.orm.public.Player.create(data);
  }

  async getAllPlayers() {
    return this.prismaService.db.orm.public.Player.all();
  }

  async getPlayerById(id: string) {
    return this.prismaService.db.orm.public.Player
      .where({ id })
      .first();
  }

  async updatePlayer(id: string, data: any) {
    return this.prismaService.db.orm.public.Player
      .where({ id })
      .update(data);
  }

  async deletePlayer(id: string) {
    return this.prismaService.db.orm.public.Player
      .where({ id })
      .delete();
  }
}