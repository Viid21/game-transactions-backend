import {Controller, Get} from '@nestjs/common';
import {PlayerService} from './player.service.js';

@Controller('api/players')
export class PlayerController {
    constructor(
        private readonly playerService: PlayerService,
    ) {}
    
    @Get()
    getPlayers() {
        return this.playerService.getPlayers();
    }
}