import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'Flash Urbano API',
      timestamp: new Date().toISOString(),
    };
  }
}
