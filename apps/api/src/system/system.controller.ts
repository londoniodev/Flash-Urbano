import { Controller, Get, Post, Res, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { SystemService } from './system.service';
import { Public, Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';

@Controller('system')
export class SystemController {
  private readonly logger = new Logger(SystemController.name);

  constructor(private readonly systemService: SystemService) {}

  @Public()
  @Get('download-apk')
  async downloadApk(@Res() res: Response) {
    try {
      const url = await this.systemService.getLatestApkUrl();
      // Redirigir al usuario directamente al archivo APK alojado en Expo
      return res.redirect(url);
    } catch (error: unknown) {
      this.logger.error('Error en getLatestApkUrl:', error instanceof Error ? error.message : error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'No se pudo generar el link de descarga',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post('reset-data')
  async resetData() {
    return this.systemService.clearOperationalData();
  }
}
