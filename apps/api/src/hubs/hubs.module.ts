import { Module } from '@nestjs/common';
import { HubsService } from './hubs.service';
import { HubsController } from './hubs.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HubsController],
  providers: [HubsService],
  exports: [HubsService],
})
export class HubsModule {}
