import { Body, Controller, Get, Post, Patch, Delete, Param } from '@nestjs/common';
import {PlayerService} from './players.service.js';
import { CreatePlayerDto } from './dto/create-player.dto.js';
import { UpdatePlayerDto } from './dto/update-player.dto.js';

@Controller('api/players')
export class PlayerController {
    constructor(
        private readonly playerService: PlayerService,
    ) {} 

    // GET /api/players/me
}