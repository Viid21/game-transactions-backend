import {Controller, Get, Param} from '@nestjs/common';
import {InventoryService} from './inventories.service.js';

@Controller('api/inventories')
export class InventoryController {
    constructor(
        private readonly InventoryService: InventoryService,
    ) {}    

    @Get(':id')
    getInventory(@Param('id') id: string) {
        return this.InventoryService.getInventoryById(id);
    }
}