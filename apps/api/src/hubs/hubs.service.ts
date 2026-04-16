import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { hubs } from '../database/schema';
import { CreateHubDto, UpdateHubDto } from './dto/hub.dto';

@Injectable()
export class HubsService {
  constructor(@Inject('DATABASE') private db: any) {}

  async findAll() {
    return this.db.select().from(hubs).orderBy(hubs.city);
  }

  async findOne(id: string) {
    const [hub] = await this.db.select().from(hubs).where(eq(hubs.id, id)).limit(1);
    if (!hub) throw new NotFoundException('Sede no encontrada');
    return hub;
  }

  async create(dto: CreateHubDto) {
    const [hub] = await this.db.insert(hubs).values(dto).returning();
    return hub;
  }

  async update(id: string, dto: UpdateHubDto) {
    await this.findOne(id);
    const [updated] = await this.db.update(hubs).set(dto).where(eq(hubs.id, id)).returning();
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.update(hubs).set({ isActive: false }).where(eq(hubs.id, id));
    return { message: 'Sede desactivada' };
  }
}
