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
  @ValidateIf(o => o.movementType !== 'AJUSTE')
  @Min(1, { message: 'La cantidad debe ser mayor a 0 para ingresos, salidas y traslados' })
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

