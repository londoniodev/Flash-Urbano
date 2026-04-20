import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { eq, and, desc, sql } from 'drizzle-orm';
import { inventoryStock, inventoryMovements, products, hubs } from '../database/schema';
import { InventoryMovementDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(@Inject('DATABASE') private db: any) {}

  async getStock(filters?: { companyId?: string; hubId?: string }) {
    let query = this.db.select({
      id: inventoryStock.id,
      quantity: inventoryStock.quantity,
      hubId: inventoryStock.hubId,
      hubName: hubs.name,
      hubCity: hubs.city,
      product: {
        id: products.id,
        sku: products.sku,
        name: products.name,
        companyId: products.companyId
      }
    })
    .from(inventoryStock)
    .innerJoin(products, eq(inventoryStock.productId, products.id))
    .innerJoin(hubs, eq(inventoryStock.hubId, hubs.id));

    const conditions = [];
    if (filters?.companyId) conditions.push(eq(products.companyId, filters.companyId));
    if (filters?.hubId) conditions.push(eq(inventoryStock.hubId, filters.hubId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query;
  }

  async getMovements(filters?: { companyId?: string; productId?: string }) {
    let query = this.db.select({
      id: inventoryMovements.id,
      movementType: inventoryMovements.movementType,
      quantity: inventoryMovements.quantity,
      createdAt: inventoryMovements.createdAt,
      operatorId: inventoryMovements.operatorId,
      notes: inventoryMovements.notes,
      product: {
        sku: products.sku,
        name: products.name,
        companyId: products.companyId
      }
    })
    .from(inventoryMovements)
    .innerJoin(products, eq(inventoryMovements.productId, products.id));

    const conditions = [];
    if (filters?.companyId) conditions.push(eq(products.companyId, filters.companyId));
    if (filters?.productId) conditions.push(eq(inventoryMovements.productId, filters.productId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return query.orderBy(desc(inventoryMovements.createdAt)).limit(100);
  }

  /**
   * Resolves a productId from either dto.productId or dto.productSku.
   * The mobile app sends productSku (barcode/SKU scanned), the web sends productId directly.
   */
  private async resolveProductId(dto: InventoryMovementDto): Promise<string> {
    if (dto.productId) return dto.productId;

    if (dto.productSku) {
      // Find product by SKU (across all companies for now; could be scoped later)
      const [product] = await this.db.select({ id: products.id })
        .from(products)
        .where(eq(products.sku, dto.productSku))
        .limit(1);

      if (!product) throw new BadRequestException(`Producto con SKU "${dto.productSku}" no encontrado`);
      return product.id;
    }

    throw new BadRequestException('Se requiere productId o productSku');
  }

  async registerMovement(dto: InventoryMovementDto, operatorId: string) {
    const productId = await this.resolveProductId(dto);

    return await this.db.transaction(async (tx: any) => {
      // Registrar el movimiento
      const [movement] = await tx.insert(inventoryMovements).values({
        productId,
        movementType: dto.movementType,
        quantity: dto.quantity,
        fromHubId: dto.fromHubId,
        toHubId: dto.toHubId,
        operatorId,
        notes: dto.notes,
      }).returning();

      // Actualizar Stock
      if (dto.movementType === 'INGRESO' && dto.toHubId) {
        await this.upsertStock(tx, productId, dto.toHubId, dto.quantity);
      } 
      else if (dto.movementType === 'SALIDA' && dto.fromHubId) {
        await this.upsertStock(tx, productId, dto.fromHubId, -dto.quantity);
      }
      else if (dto.movementType === 'TRASLADO' && dto.fromHubId && dto.toHubId) {
        await this.upsertStock(tx, productId, dto.fromHubId, -dto.quantity);
        await this.upsertStock(tx, productId, dto.toHubId, dto.quantity);
      }
      else if (dto.movementType === 'AJUSTE' && dto.toHubId) {
         // AJUSTE puede ser positivo o negativo, pasamos tal cual el quantity
        await this.upsertStock(tx, productId, dto.toHubId, dto.quantity);
      }

      return movement;
    });
  }

  private async upsertStock(tx: any, productId: string, hubId: string, quantityDelta: number) {
    const existing = await tx.select().from(inventoryStock).where(
      and(eq(inventoryStock.productId, productId), eq(inventoryStock.hubId, hubId))
    ).limit(1);

    if (existing.length > 0) {
      const newQty = existing[0].quantity + quantityDelta;
      if (newQty < 0) throw new BadRequestException('El stock no puede quedar negativo');
      
      await tx.update(inventoryStock)
        .set({ quantity: newQty, updatedAt: new Date() })
        .where(eq(inventoryStock.id, existing[0].id));
    } else {
      if (quantityDelta < 0) throw new BadRequestException('No hay stock para descontar');
      
      await tx.insert(inventoryStock).values({
        productId,
        hubId,
        quantity: quantityDelta,
      });
    }
  }
}
