import { Controller, Get, Post, Body, Param, Query, Request, BadRequestException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryMovementDto } from './dto/inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('stock')
  getStock(
    @Request() req: any,
    @Query('companyId') queryCompanyId?: string,
    @Query('hubId') hubId?: string,
  ) {
    const companyId = req.user.role === 'CLIENT' ? req.user.companyId : queryCompanyId;
    return this.inventoryService.getStock({ companyId, hubId });
  }

  @Get('movements')
  getMovements(
    @Request() req: any,
    @Query('companyId') queryCompanyId?: string,
    @Query('productId') productId?: string,
  ) {
    const companyId = req.user.role === 'CLIENT' ? req.user.companyId : queryCompanyId;
    return this.inventoryService.getMovements({ companyId, productId });
  }

  @Post('move')
  registerMovement(@Body() dto: InventoryMovementDto, @Request() req: any) {
    if (req.user.role === 'CLIENT') {
      throw new BadRequestException('Los clientes no pueden registrar movimientos directos');
    }
    return this.inventoryService.registerMovement(dto, req.user.id);
  }
}
