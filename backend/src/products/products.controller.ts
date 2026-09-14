import { Controller, Get, Param } from '@nestjs/common';
import { ProductService } from './products.service.js';

@Controller('api/products')
export class ProductController {

  constructor(
    private readonly productService: ProductService,
  ) {}  

  @Get()
  getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }
}
