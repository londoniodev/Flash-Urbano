import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Solo deja pasar propiedades definidas en el DTO
      forbidNonWhitelisted: true, // Rechaza propiedades no definidas
      transform: true,          // Transforma payloads a instancias del DTO
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Flash Urbano API corriendo en puerto ${port}`);
}
bootstrap();
