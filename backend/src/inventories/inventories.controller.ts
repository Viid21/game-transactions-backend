import {Controller, Get, Param} from '@nestjs/common';
import {InventoryService} from './inventories.service.js';

@Controller('api/inventories')
export class InventoryController {
    constructor(
        private readonly InventoryService: InventoryService,
    ) {} 

    //GET /api/inventories/me
}