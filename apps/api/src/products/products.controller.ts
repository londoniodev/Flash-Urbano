import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(
    @Request() req: any,
    @Query('companyId') queryCompanyId?: string,
  ) {
    const companyId = req.user.role === 'CLIENT' ? req.user.companyId : queryCompanyId;
    return this.productsService.findAll({ companyId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/passport')
  getPassport(@Param('id') id: string) {
    return this.productsService.getPassport(id);
  }

  @Get('sku/:companyId/:sku')
  findBySku(@Param('companyId') companyId: string, @Param('sku') sku: string) {
    return this.productsService.findBySku(companyId, sku);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
