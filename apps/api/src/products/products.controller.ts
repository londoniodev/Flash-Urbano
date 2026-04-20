import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';

@Controller('products')
@UseGuards(RolesGuard)
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
  findOne(@Param('id') id: string, @Request() req: any) {
    const companyId = req.user.role === 'CLIENT' ? req.user.companyId : undefined;
    return this.productsService.findOne(id, companyId);
  }

  @Get(':id/passport')
  getPassport(@Param('id') id: string, @Request() req: any) {
    const companyId = req.user.role === 'CLIENT' ? req.user.companyId : undefined;
    return this.productsService.getPassport(id, companyId);
  }

  @Get('sku/:companyId/:sku')
  findBySku(@Param('companyId') companyId: string, @Param('sku') sku: string) {
    return this.productsService.findBySku(companyId, sku);
  }

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERATOR')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Request() req: any) {
    // Note: Even though only ADMIN/OPERATOR can update, we might want to check ownership if they were allowed
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'OPERATOR')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
