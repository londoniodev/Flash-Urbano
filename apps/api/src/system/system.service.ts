import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);
  private readonly projectId = 'e2b32a33-6db9-4a9f-855d-84aac2538aaa';
  private readonly expoToken = '4nUFZRP9gF77VnR8bEFQy9ALIn4kxp4nJAU5jz9l';

  async getLatestApkUrl(): Promise<string> {
    try {
      this.logger.log('Buscando el último build exitoso en Expo...');
      
      const response = await fetch(
        `https://api.expo.dev/v2/projects/${this.projectId}/builds?platform=android&status=finished&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${this.expoToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error('Error al consultar la API de Expo', JSON.stringify(errorData));
        throw new Error('No se pudo obtener la información de Expo');
      }

      const data: any = await response.json();
      const latestBuild = data.data?.[0];

      if (!latestBuild || !latestBuild.artifacts?.buildUrl) {
        throw new Error('No se encontró ningún build finalizado con artefactos');
      }

      return latestBuild.artifacts.buildUrl;
    } catch (error) {
      this.logger.error('Error en getLatestApkUrl:', error.message);
      throw error;
    }
  }
}
