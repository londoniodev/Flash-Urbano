import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { HubsService } from './hubs.service';
import { CreateHubDto, UpdateHubDto } from './dto/hub.dto';
import { Roles } from '../auth/decorators';

@Controller('hubs')
export class HubsController {
  constructor(private hubsService: HubsService) {}

  @Get()
  findAll() {
    return this.hubsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hubsService.findOne(id);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateHubDto) {
    return this.hubsService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHubDto) {
    return this.hubsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hubsService.remove(id);
  }
}
