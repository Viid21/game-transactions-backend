import { Controller, Get } from '@nestjs/common';
import { ProductService } from './product.service.js';

@Controller('api/products')
export class ProductController {

  constructor(
    private readonly productService: ProductService,
  ) {}

  @Get()
  getProduct() {
    return this.productService.getProduct();
  }

}