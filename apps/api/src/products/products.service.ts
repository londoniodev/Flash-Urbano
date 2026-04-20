import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { products, inventoryStock, inventoryMovements, hubs, users } from '../database/schema';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(@Inject('DATABASE') private db: any) {}

  async findAll(filters?: { companyId?: string }) {
    let query = this.db.select().from(products);

    if (filters?.companyId) {
      query = query.where(eq(products.companyId, filters.companyId));
    }

    return query.orderBy(desc(products.createdAt));
  }

  async findOne(id: string, companyId?: string) {
    const [product] = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!product) throw new NotFoundException('Producto no encontrado');
    
    if (companyId && product.companyId !== companyId) {
      throw new ForbiddenException('No tienes permiso para acceder a este producto');
    }
    
    return product;
  }

  async findBySku(companyId: string, sku: string) {
    const [product] = await this.db.select().from(products).where(
      and(eq(products.companyId, companyId), eq(products.sku, sku))
    ).limit(1);
    
    if (!product) throw new NotFoundException('Producto no encontrado por SKU');
    return product;
  }

  /**
   * "Hoja de Vida" del producto: datos + stock por sede + historial de movimientos
   */
  async getPassport(id: string, companyId?: string) {
    const product = await this.findOne(id, companyId);

    // Stock desglosado por sede
    const stock = await this.db.select({
      quantity: inventoryStock.quantity,
      hubId: inventoryStock.hubId,
      hubName: hubs.name,
      hubCity: hubs.city,
    })
    .from(inventoryStock)
    .innerJoin(hubs, eq(inventoryStock.hubId, hubs.id))
    .where(eq(inventoryStock.productId, id));

    // Últimos 30 movimientos
    const movements = await this.db.select({
      id: inventoryMovements.id,
      movementType: inventoryMovements.movementType,
      quantity: inventoryMovements.quantity,
      notes: inventoryMovements.notes,
      createdAt: inventoryMovements.createdAt,
      operatorId: inventoryMovements.operatorId,
      fromHubId: inventoryMovements.fromHubId,
      toHubId: inventoryMovements.toHubId,
    })
    .from(inventoryMovements)
    .where(eq(inventoryMovements.productId, id))
    .orderBy(desc(inventoryMovements.createdAt))
    .limit(30);

    // Calcular total de unidades en todas las sedes
    const totalUnits = stock.reduce((acc: number, s: any) => acc + s.quantity, 0);

    return {
      product,
      totalUnits,
      stockBySede: stock,
      movements,
    };
  }

  /**
   * Buscar por SKU (sin companyId) — usado por el escáner móvil
   */
  async findBySkuGlobal(sku: string) {
    const [product] = await this.db.select().from(products).where(
      eq(products.sku, sku)
    ).limit(1);

    if (!product) throw new NotFoundException('Producto no encontrado por SKU');
    return product;
  }

  async create(dto: CreateProductDto) {
    const existing = await this.db.select().from(products).where(
      and(eq(products.companyId, dto.companyId), eq(products.sku, dto.sku))
    ).limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('El SKU ya existe para esta compañía');
    }

    const [product] = await this.db.insert(products).values(dto).returning();
    return product;
  }

  async update(id: string, dto: UpdateProductDto, companyId?: string) {
    await this.findOne(id, companyId);
    const [updated] = await this.db
      .update(products)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    return updated;
  }

  async remove(id: string, companyId?: string) {
    await this.findOne(id, companyId);
    await this.db.delete(products).where(eq(products.id, id));
    return { success: true };
  }
}

