import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryMovementDto } from './dto/inventory.dto';
import { Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';

@Controller('inventory')
@UseGuards(RolesGuard)
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
  @Roles('ADMIN', 'OPERATOR')
  registerMovement(@Body() dto: InventoryMovementDto, @Request() req: any) {
    return this.inventoryService.registerMovement(dto, req.user.id);
  }
}
