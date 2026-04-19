import { IsString, IsOptional, IsUUID, IsEnum, IsInt, Min, ValidateIf } from 'class-validator';

export class InventoryMovementDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsString()
  productSku?: string;

  @IsEnum(['INGRESO', 'SALIDA', 'AJUSTE', 'TRASLADO'])
  movementType: 'INGRESO' | 'SALIDA' | 'AJUSTE' | 'TRASLADO';

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsUUID()
  fromHubId?: string;

  @IsOptional()
  @IsUUID()
  toHubId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

