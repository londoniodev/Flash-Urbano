import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE } from '../database/database.module';
import { packages, packageMovements } from '../database/schema';
import { eq, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from '../database/schema';

@Injectable()
export class PackagesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  /** Obtener todos los paquetes de una empresa */
  async findByCompany(companyId: string) {
    return this.db
      .select()
      .from(packages)
      .where(eq(packages.companyId, companyId))
      .orderBy(desc(packages.createdAt));
  }

  /** Obtener un paquete por su ID */
  async findOne(id: string) {
    const result = await this.db
      .select()
      .from(packages)
      .where(eq(packages.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  /** Crear un nuevo paquete (Ingreso de mercancía) */
  async create(data: {
    companyId: string;
    hubId: string;
    description: string;
    weight?: number;
    operatorId: string;
  }) {
    const [newPackage] = await this.db
      .insert(packages)
      .values({
        companyId: data.companyId,
        hubId: data.hubId,
        description: data.description,
        weight: data.weight,
        status: 'RECIBIDO',
      })
      .returning();

    // Registrar movimiento inicial de INGRESO en el Kardex
    await this.db.insert(packageMovements).values({
      packageId: newPackage.id,
      movementType: 'INGRESO',
      toHubId: data.hubId,
      operatorId: data.operatorId,
    });

    return newPackage;
  }

  /** Obtener historial de movimientos de un paquete */
  async getMovements(packageId: string) {
    return this.db
      .select()
      .from(packageMovements)
      .where(eq(packageMovements.packageId, packageId))
      .orderBy(desc(packageMovements.createdAt));
  }
}
