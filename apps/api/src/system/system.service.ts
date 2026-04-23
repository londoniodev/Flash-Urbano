import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);
  private readonly projectId = 'e2b32a33-6db9-4a9f-855d-84aac2538aaa';
  private readonly expoToken = '_NoJ3fjRXWzppGb2IbtvYrVFMdtWTp5I9P62fQff';

  async getLatestApkUrl(): Promise<string> {
    try {
      this.logger.log('Buscando el último build exitoso en Expo (via GraphQL)...');
      
      const query = `
        query GetLatestBuild($account: String!, $slug: String!) {
          app {
            byConfigOrSlug(accountName: $account, slug: $slug) {
              builds(limit: 1, filter: { platform: ANDROID, status: FINISHED }) {
                artifacts {
                  buildUrl
                }
              }
            }
          }
        }
      `;

      const response = await fetch('https://api.expo.dev/v2/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.expoToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            account: 'renny-12',
            slug: 'flash-urbano',
          },
        }),
      });

      const responseText = await response.text();
      let result: any;
      
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        this.logger.error('Respuesta no JSON de Expo:', responseText);
        throw new Error(`Error de comunicación con Expo (Status ${response.status})`);
      }

      if (result.errors) {
        this.logger.error('Errores en consulta GraphQL:', JSON.stringify(result.errors));
        throw new Error('La API de Expo devolvió errores en la consulta');
      }

      const build = result.data?.app?.byConfigOrSlug?.builds?.[0];

      if (!build || !build.artifacts?.buildUrl) {
        throw new Error('No se encontró ningún build finalizado con artefactos');
      }

      return build.artifacts.buildUrl;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('Error en getLatestApkUrl:', message);
      throw error;
    }
  }
}
