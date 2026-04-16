import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateHubDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  address: string;
}

export class UpdateHubDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  isActive?: boolean;
}
