import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { users } from '../database/schema';
import type { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DATABASE') private db: any,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    // Buscar usuario por email
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId ?? undefined,
      hubId: user.hubId ?? undefined,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
