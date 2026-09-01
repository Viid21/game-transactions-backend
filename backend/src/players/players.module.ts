import { Module } from '@nestjs/common';
import { PlayerController } from './players.controller.js';
import { PlayerService } from './players.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PlayerController],
  providers: [PlayerService],
})
export class PlayerModule {}
