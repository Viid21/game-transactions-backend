import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductModule } from './product/product.module.js';
import { PlayerModule } from './player/player.module.js';


@Module({
  imports: [ProductModule, PlayerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
