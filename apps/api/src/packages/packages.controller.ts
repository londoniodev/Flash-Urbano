import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  /** GET /api/packages?companyId=xxx */
  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.packagesService.findByCompany(companyId);
  }

  /** GET /api/packages/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  /** POST /api/packages */
  @Post()
  create(
    @Body()
    body: {
      companyId: string;
      hubId: string;
      description: string;
      weight?: number;
      operatorId: string;
    },
  ) {
    return this.packagesService.create(body);
  }

  /** GET /api/packages/:id/movements */
  @Get(':id/movements')
  getMovements(@Param('id') id: string) {
    return this.packagesService.getMovements(id);
  }
}
