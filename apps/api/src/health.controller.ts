import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'flash-urbano-api',
      timestamp: new Date().toISOString(),
    };
  }
}
