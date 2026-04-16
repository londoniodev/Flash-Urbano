import { IsString, IsOptional, IsUUID, IsEnum, IsInt, Min } from 'class-validator';

export class CreatePackageDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  hubId: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  weight?: number;
}

export class UpdatePackageDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['RECIBIDO', 'EN_BODEGA', 'EN_TRANSITO', 'DESPACHADO', 'ENTREGADO'])
  status?: 'RECIBIDO' | 'EN_BODEGA' | 'EN_TRANSITO' | 'DESPACHADO' | 'ENTREGADO';

  @IsOptional()
  @IsUUID()
  hubId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  weight?: number;
}
