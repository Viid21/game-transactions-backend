import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PlayerService {constructor(
    private readonly prismaService: PrismaService,
  ) {}

  async findOrCreateBySteamId(steamId: string) {
    const player = await this.prismaService.db.orm.public.Player
        .where({ steamId })
        .first();

    if (player) {
        return player;
    }

    return this.prismaService.db.orm.public.Player.create({
        username: `SteamUser_${steamId}`,
        steamId,
    });
  }

  async getPlayerById(id: string) {
    return this.prismaService.db.orm.public.Player
      .where({ id })
      .first();
  }
}
