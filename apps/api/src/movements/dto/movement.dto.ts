import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';

export class CreateMovementDto {
  @IsUUID()
  packageId: string;

  @IsEnum(['INGRESO', 'TRASLADO', 'SALIDA'], { message: 'Tipo de movimiento inválido' })
  movementType: 'INGRESO' | 'TRASLADO' | 'SALIDA';

  @IsOptional()
  @IsUUID()
  fromHubId?: string;

  @IsUUID()
  toHubId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
