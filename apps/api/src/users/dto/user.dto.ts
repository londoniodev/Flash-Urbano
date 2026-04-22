import { IsEmail, IsString, IsOptional, IsEnum, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password: string;

  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  lastName: string;

  @IsEnum(['ADMIN', 'OPERATOR', 'CLIENT'], { message: 'Rol inválido' })
  @IsOptional()
  role?: 'ADMIN' | 'OPERATOR' | 'CLIENT';

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  hubId?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'OPERATOR', 'CLIENT'])
  role?: 'ADMIN' | 'OPERATOR' | 'CLIENT';

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  hubId?: string;

  @IsOptional()
  isActive?: boolean;
}
