import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);
  private readonly projectId = 'e2b32a33-6db9-4a9f-855d-84aac2538aaa';
  private readonly expoToken = '_NoJ3fjRXWzppGb2IbtvYrVFMdtWTp5I9P62fQff';

  async getLatestApkUrl(): Promise<string> {
    try {
      this.logger.log('Buscando el último build exitoso en Expo...');
      
      const projectId = 'e2b32a33-6db9-4a9f-855d-84aac2538aaa';
      
      const response = await fetch(
        `https://api.expo.dev/v2/projects/${projectId}/builds?platform=android&status=finished&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${this.expoToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const responseText = await response.text();
      let data: any;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        this.logger.error('La respuesta de Expo no es un JSON válido:', responseText);
        throw new Error(`Error de formato en Expo (Status ${response.status})`);
      }

      if (!response.ok) {
        this.logger.error('Error al consultar la API de Expo', JSON.stringify(data));
        throw new Error('No se pudo obtener la información de Expo');
      }
      const latestBuild = data.data?.[0];

      if (!latestBuild || !latestBuild.artifacts?.buildUrl) {
        throw new Error('No se encontró ningún build finalizado con artefactos');
      }

      return latestBuild.artifacts.buildUrl;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Error en getLatestApkUrl:', message);
      throw error;
    }
  }
}
