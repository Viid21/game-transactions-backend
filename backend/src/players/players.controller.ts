import { Controller, Get, Req, UseGuards} from '@nestjs/common';
import { PlayerService } from './players.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('api/players')
export class PlayerController {
    constructor(
        private readonly playerService: PlayerService,
    ) {} 

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMe(@Req() request: any) {
        return this.playerService.getPlayerById(
            request.user.playerId,
        );
    }
}