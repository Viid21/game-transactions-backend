import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductModule } from './products/products.module.js';
import { PlayerModule } from './players/players.module.js';


@Module({
  imports: [ProductModule, PlayerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
