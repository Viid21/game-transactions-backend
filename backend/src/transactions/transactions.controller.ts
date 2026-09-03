import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { TransactionService } from './transactions.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';

@Controller('api/transactions')
export class TransactionController {
    constructor(
        private readonly transactionService: TransactionService,
    ) {}    

    @Post()
    createTransaction(@Body() transactionData: CreateTransactionDto) {
        return this.transactionService.createTransaction(transactionData);
    }

    @Get(':id')
    getTransaction(@Param('id') id: string) {
        return this.transactionService.getTransactionById(id);
    }
}