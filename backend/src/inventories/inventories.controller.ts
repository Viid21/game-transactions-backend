import {Controller, Get, Req, UseGuards} from '@nestjs/common';
import {InventoryService} from './inventories.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('api/inventories')
export class InventoryController {
    constructor(
        private readonly InventoryService: InventoryService,
    ) {} 

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMine(@Req() request: { user: { playerId: string } }) {
        return this.InventoryService.getPlayerInventory(request.user.playerId);
    }
}
