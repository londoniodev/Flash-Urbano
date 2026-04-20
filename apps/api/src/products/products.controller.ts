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
  @Roles('ADMIN', 'OPERATOR', 'CLIENT')
  create(@Body() dto: CreateProductDto, @Request() req: any) {
    // For CLIENT, ensure they use their own companyId
    if (req.user.role === 'CLIENT') {
      dto.companyId = req.user.companyId;
    }
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERATOR', 'CLIENT')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Request() req: any) {
    const companyId = req.user.role === 'CLIENT' ? req.user.companyId : undefined;
    return this.productsService.update(id, dto, companyId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'OPERATOR', 'CLIENT')
  remove(@Param('id') id: string, @Request() req: any) {
    const companyId = req.user.role === 'CLIENT' ? req.user.companyId : undefined;
    return this.productsService.remove(id, companyId);
  }
}
