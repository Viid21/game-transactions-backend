import { Controller, Get } from '@nestjs/common';
import { PlayerService } from './players.service.js';

@Controller('api/players')
export class PlayerController {
    constructor(
        private readonly playerService: PlayerService,
    ) {} 

    // GET /api/players/me
}