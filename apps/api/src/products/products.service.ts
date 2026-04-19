import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { products } from '../database/schema';
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

  async findOne(id: string) {
    const [product] = await this.db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async findBySku(companyId: string, sku: string) {
    const [product] = await this.db.select().from(products).where(
      and(eq(products.companyId, companyId), eq(products.sku, sku))
    ).limit(1);
    
    if (!product) throw new NotFoundException('Producto no encontrado por SKU');
    return product;
  }

  async create(dto: CreateProductDto) {
    // Check if SKU already exists for this company
    const existing = await this.db.select().from(products).where(
      and(eq(products.companyId, dto.companyId), eq(products.sku, dto.sku))
    ).limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('El SKU ya existe para esta compañía');
    }

    const [product] = await this.db.insert(products).values(dto).returning();
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(products)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.delete(products).where(eq(products.id, id));
    return { success: true };
  }
}
