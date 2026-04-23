import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Obtiene el link de descarga del último build exitoso de Android desde Expo.
   */
  async getLatestApkUrl(): Promise<string> {
    const expoToken = this.configService.get<string>('EXPO_TOKEN') || '_NoJ3fjRXWzppGb2IbtvYrVFMdtWTp5I9P62fQff';
    const projectId = this.configService.get<string>('EXPO_PROJECT_ID') || 'e2b32a33-6db9-4a9f-855d-84aac2538aaa';

    const query = `
      query GetLatestBuild($projectId: String!) {
        app {
          byId(appId: $projectId) {
            builds(limit: 1, offset: 0, filter: { platform: ANDROID, status: FINISHED }) {
              artifacts {
                buildUrl
              }
            }
          }
        }
      }
    `;

    try {
      this.logger.log(`Consultando último build para proyecto: ${projectId}`);
      
      const response = await fetch('https://api.expo.dev/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${expoToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { projectId },
        }),
      });

      const result = await this.handleResponse(response);
      const buildUrl = result.data?.app?.byId?.builds?.[0]?.artifacts?.buildUrl;

      if (!buildUrl) {
        throw new Error('No se encontró un build exitoso con artefactos de descarga.');
      }

      return buildUrl;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Fallo al obtener APK de Expo: ${msg}`);
      throw error;
    }
  }

  /**
   * Maneja la respuesta de la API y valida si es un JSON correcto o tiene errores de GraphQL.
   */
  private async handleResponse(response: Response): Promise<any> {
    const text = await response.text();
    let json: any;

    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Respuesta no válida de Expo (Status ${response.status}): ${text.slice(0, 100)}`);
    }

    if (json.errors) {
      const errorMsg = json.errors.map((e: any) => e.message).join(', ');
      throw new Error(`Errores de Expo: ${errorMsg}`);
    }

    return json;
  }
}
