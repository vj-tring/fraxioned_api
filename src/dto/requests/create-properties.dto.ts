import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Users } from 'src/entities/users.entity';

export class CreatePropertiesDto {
  @IsNotEmpty()
  @IsString()
  propertyName: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  zipcode?: number;

  @IsOptional()
  @IsString()
  houseDescription?: string;

  @IsOptional()
  @IsBoolean()
  isExclusive?: boolean;

  @IsOptional()
  @IsNumber()
  propertyShare?: number;

  @IsOptional()
  @IsString()
  mapCoordinates?: string = 'POINT (0 0)';

  @IsInt()
  @Min(1)
  createdBy: Users;
}
