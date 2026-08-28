import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {

  getProduct() {
    return [
      {
        id: 'sword_001',
        name: 'Iron Sword',
        price: 1.99,
        currency: 'EUR',
      },
      {
        id: 'coins_500',
        name: '500 Coins',
        price: 4.99,
        currency: 'EUR',
      },
    ];
  }
}