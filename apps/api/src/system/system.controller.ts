import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { SystemService } from './system.service';
import { Public } from '../auth/decorators';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Public()
  @Get('download-apk')
  async downloadApk(@Res() res: Response) {
    try {
      const url = await this.systemService.getLatestApkUrl();
      // Redirigir al usuario directamente al archivo APK alojado en Expo
      return res.redirect(url);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'No se pudo generar el link de descarga',
        error: error.message,
      });
    }
  }
}
