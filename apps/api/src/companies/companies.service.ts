import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { companies } from '../database/schema';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(@Inject('DATABASE') private db: any) {}

  async findAll() {
    return this.db.select().from(companies).orderBy(companies.createdAt);
  }

  async findOne(id: string) {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.id, id))
      .limit(1);

    if (!company) throw new NotFoundException('Empresa no encontrada');
    return company;
  }

  async create(dto: CreateCompanyDto) {
    // Verificar NIT único
    const [existing] = await this.db
      .select()
      .from(companies)
      .where(eq(companies.nit, dto.nit))
      .limit(1);

    if (existing) throw new ConflictException('Ya existe una empresa con este NIT');

    const [company] = await this.db
      .insert(companies)
      .values(dto)
      .returning();

    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id); // Verificar que existe
    const [updated] = await this.db
      .update(companies)
      .set(dto)
      .where(eq(companies.id, id))
      .returning();

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.update(companies).set({ isActive: false }).where(eq(companies.id, id));
    return { message: 'Empresa desactivada' };
  }
}
