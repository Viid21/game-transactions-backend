import { Module } from '@nestjs/common';
import { PlayerController } from './players.controller.js';
import { PlayerService } from './players.service.js';

@Module({
  controllers: [PlayerController],
  providers: [PlayerService],
})
export class PlayerModule {}
