import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { packages, packageMovements } from '../database/schema';
import { CreatePackageDto, UpdatePackageDto } from './dto/package.dto';

@Injectable()
export class PackagesService {
  constructor(@Inject('DATABASE') private db: any) {}

  async findAll(filters?: { companyId?: string; hubId?: string; status?: string }) {
    let query = this.db.select().from(packages);

    const conditions = [];
    if (filters?.companyId) conditions.push(eq(packages.companyId, filters.companyId));
    if (filters?.hubId) conditions.push(eq(packages.hubId, filters.hubId));
    if (filters?.status) conditions.push(eq(packages.status, filters.status as any));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(packages.createdAt));
  }

  async findOne(id: string) {
    const [pkg] = await this.db.select().from(packages).where(eq(packages.id, id)).limit(1);
    if (!pkg) throw new NotFoundException('Paquete no encontrado');
    return pkg;
  }

  async findByQr(qrCode: string) {
    const [pkg] = await this.db.select().from(packages).where(eq(packages.qrCode, qrCode)).limit(1);
    if (!pkg) throw new NotFoundException('Paquete no encontrado por QR');
    return pkg;
  }

  async create(dto: CreatePackageDto, operatorId: string) {
    // Crear el paquete
    const [pkg] = await this.db.insert(packages).values(dto).returning();

    // Registrar movimiento de INGRESO automáticamente
    await this.db.insert(packageMovements).values({
      packageId: pkg.id,
      movementType: 'INGRESO',
      toHubId: dto.hubId,
      operatorId,
      notes: 'Ingreso inicial al sistema',
    });

    return pkg;
  }

  async update(id: string, dto: UpdatePackageDto) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(packages)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(packages.id, id))
      .returning();

    return updated;
  }
}
