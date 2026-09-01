import { Body, Controller, Get, Post, Patch, Delete, Param } from '@nestjs/common';
import { ProductService } from './products.service.js';
import { CreateProductDto } from './dtoProduct/dto.product-create.js';
import { UpdateProductDto } from './dtoProduct/dto.product-update.js';

@Controller('api/products')
export class ProductController {

  constructor(
    private readonly productService: ProductService,
  ) {}

  @Post()
  createProduct(@Body() data: CreateProductDto, ) {
    return this.productService.createProduct(data);
  }

  @Get()
  getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  @Patch(':id')
  updateProduct(@Param('id') id: string, @Body() data: UpdateProductDto) {
    return this.productService.updateProduct(id, data);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(id);
  }

}