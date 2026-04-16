import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/movement.dto';

@Controller('movements')
export class MovementsController {
  constructor(private movementsService: MovementsService) {}

  @Get()
  findAll(
    @Query('packageId') packageId?: string,
    @Query('movementType') movementType?: string,
  ) {
    return this.movementsService.findAll({ packageId, movementType });
  }

  @Get('package/:packageId')
  findByPackage(@Param('packageId') packageId: string) {
    return this.movementsService.findByPackage(packageId);
  }

  @Post()
  create(@Body() dto: CreateMovementDto, @Request() req: any) {
    return this.movementsService.create(dto, req.user.id);
  }
}
