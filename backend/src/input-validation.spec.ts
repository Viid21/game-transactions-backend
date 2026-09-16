import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthenticateDto } from './auth/dto/authenticate.dto.js';
import { CreateOrderDto } from './orders/dto/create-order.dto.js';

describe('request DTOs', () => {
  it('accepts an authentication ticket', async () => {
    const errors = await validate(plainToInstance(AuthenticateDto, { ticket: 'fake-ticket-001' }));
    expect(errors).toHaveLength(0);
  });

  it('converts and validates a purchase quantity', async () => {
    const dto = plainToInstance(CreateOrderDto, { productId: 'af020f3a-351c-4ca4-a7a0-c25b7ba71d2a', quantity: '2' });
    expect(dto.quantity).toBe(2);
    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects an invalid product id and quantity', async () => {
    const errors = await validate(plainToInstance(CreateOrderDto, { productId: 'coins', quantity: 0 }));
    expect(errors).toHaveLength(2);
  });
});
