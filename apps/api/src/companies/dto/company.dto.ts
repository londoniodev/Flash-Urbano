import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(20)
  nit: string;

  @IsEmail({}, { message: 'Email de contacto inválido' })
  contactEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;
}

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @IsOptional()
  isActive?: boolean;
}
