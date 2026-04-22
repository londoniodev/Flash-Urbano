import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { users } from '../database/schema';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE') private db: any) {}

  async findAll() {
    const result = await this.db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        companyId: users.companyId,
        hubId: users.hubId,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return result;
  }

  async findOne(id: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        companyId: users.companyId,
        hubId: users.hubId,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CreateUserDto) {
    // Verificar email único
    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing) throw new ConflictException('Ya existe un usuario con este email');

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const [user] = await this.db
      .insert(users)
      .values({
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        companyId: dto.companyId,
        hubId: dto.hubId,
      })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        companyId: users.companyId,
        hubId: users.hubId,
        isActive: users.isActive,
        createdAt: users.createdAt,
      });

    return user;
  }

  async registerPublic(dto: CreateUserDto) {
    // Check if it's the first user ever
    const existingUsers = await this.db.select({ id: users.id }).from(users).limit(1);
    const isFirstUser = existingUsers.length === 0;

    // Force role: ADMIN if first user, else CLIENT
    const roleToAssign = isFirstUser ? 'ADMIN' : 'CLIENT';

    const safeDto = { ...dto, role: roleToAssign as any, companyId: undefined, hubId: undefined };
    return this.create(safeDto);
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    const [updated] = await this.db
      .update(users)
      .set(dto)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        companyId: users.companyId,
        hubId: users.hubId,
        isActive: users.isActive,
      });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.db.update(users).set({ isActive: false }).where(eq(users.id, id));
    return { message: 'Usuario desactivado' };
  }
}
