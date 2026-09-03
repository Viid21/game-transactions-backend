import { Body, Controller, Get, Post, Patch, Delete, Param } from '@nestjs/common';
import {PlayerService} from './players.service.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';

@Controller('api/players')
export class PlayerController {
    constructor(
        private readonly playerService: PlayerService,
    ) {}    

    @Post()
    createPlayer(@Body() playerData: CreatePlayerDto) {
        return this.playerService.createPlayer(playerData);
    }

    @Get()
    getPlayers() {
        return this.playerService.getAllPlayers();
    }

    @Get(':id')
    getPlayer(@Param('id') id: string) {
        return this.playerService.getPlayerById(id);
    }

    @Patch(':id')
    updatePlayer(@Param('id') id: string, @Body() playerData: UpdatePlayerDto) {
        return this.playerService.updatePlayer(id, playerData);
    }

    @Delete(':id')
    deletePlayer(@Param('id') id: string) {
        return this.playerService.deletePlayer(id);
    }
}