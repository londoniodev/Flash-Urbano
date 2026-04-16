import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { eq, desc, and } from 'drizzle-orm';
import { packageMovements, packages } from '../database/schema';
import { CreateMovementDto } from './dto/movement.dto';

@Injectable()
export class MovementsService {
  constructor(@Inject('DATABASE') private db: any) {}

  async findAll(filters?: { packageId?: string; hubId?: string; movementType?: string }) {
    let query = this.db.select().from(packageMovements);

    const conditions = [];
    if (filters?.packageId) conditions.push(eq(packageMovements.packageId, filters.packageId));
    if (filters?.movementType) conditions.push(eq(packageMovements.movementType, filters.movementType as any));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(packageMovements.createdAt));
  }

  async findByPackage(packageId: string) {
    return this.db
      .select()
      .from(packageMovements)
      .where(eq(packageMovements.packageId, packageId))
      .orderBy(desc(packageMovements.createdAt));
  }

  async create(dto: CreateMovementDto, operatorId: string) {
    // Validar lógica de negocio según tipo de movimiento
    if (dto.movementType === 'TRASLADO' && !dto.fromHubId) {
      throw new BadRequestException('Un traslado requiere sede de origen (fromHubId)');
    }

    if (dto.movementType === 'TRASLADO' && dto.fromHubId === dto.toHubId) {
      throw new BadRequestException('La sede de origen y destino no pueden ser la misma');
    }

    // Determinar nuevo estado del paquete según el movimiento
    let newStatus: string;
    switch (dto.movementType) {
      case 'INGRESO':
        newStatus = 'EN_BODEGA';
        break;
      case 'TRASLADO':
        newStatus = 'EN_TRANSITO';
        break;
      case 'SALIDA':
        newStatus = 'DESPACHADO';
        break;
    }

    // Registrar movimiento
    const [movement] = await this.db
      .insert(packageMovements)
      .values({
        ...dto,
        operatorId,
      })
      .returning();

    // Actualizar estado y sede del paquete
    await this.db
      .update(packages)
      .set({
        status: newStatus,
        hubId: dto.toHubId,
        updatedAt: new Date(),
      })
      .where(eq(packages.id, dto.packageId));

    return movement;
  }
}
