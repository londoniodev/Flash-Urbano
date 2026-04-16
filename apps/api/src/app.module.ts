import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { HubsModule } from './hubs/hubs.module';
import { UsersModule } from './users/users.module';
import { PackagesModule } from './packages/packages.module';
import { MovementsModule } from './movements/movements.module';
import { HealthController } from './health.controller';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    CompaniesModule,
    HubsModule,
    UsersModule,
    PackagesModule,
    MovementsModule,
  ],
  controllers: [HealthController],
  providers: [
    // Guards globales: TODAS las rutas requieren JWT excepto @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
