import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrderService } from './orders.service.js';

@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Req() request: { user: { playerId: string } }, @Body() body: CreateOrderDto) {
    return this.orderService.createPurchase(request.user.playerId, body);
  }

  @Post(':id/confirm')
  confirm(@Req() request: { user: { playerId: string } }, @Param('id') id: string) {
    return this.orderService.confirmPurchase(request.user.playerId, id);
  }

  @Get(':id')
  get(@Req() request: { user: { playerId: string } }, @Param('id') id: string) {
    return this.orderService.getOwnedOrder(request.user.playerId, id);
  }
}
