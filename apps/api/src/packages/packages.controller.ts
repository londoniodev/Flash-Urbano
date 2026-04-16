import { Controller, Get, Post, Patch, Body, Param, Query, Request } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';

@Controller('packages')
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Get()
  findAll(
    @Query('companyId') companyId?: string,
    @Query('hubId') hubId?: string,
    @Query('status') status?: string,
  ) {
    return this.packagesService.findAll({ companyId, hubId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(id);
  }

  @Get('qr/:qrCode')
  findByQr(@Param('qrCode') qrCode: string) {
    return this.packagesService.findByQr(qrCode);
  }

  @Post()
  create(@Body() dto: CreatePackageDto, @Request() req: any) {
    return this.packagesService.create(dto, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.packagesService.update(id, dto);
  }
}
