import { Module } from '@nestjs/common';
import { TransactionService } from './transactions.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
