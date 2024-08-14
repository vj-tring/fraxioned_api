import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { User } from 'src/main/entities/user.entity';

export class CommonPropertiesResponseDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  propertyName: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsNumber()
  zipcode: number;

  @IsString()
  houseDescription: string;

  @IsBoolean()
  isExclusive: boolean;

  @IsNumber()
  propertyShare: number;

  @IsOptional()
  latitude: number;

  @IsOptional()
  longitude: number;

  @IsOptional()
  isActive: boolean;

  @IsInt()
  @Min(1)
  createdBy: User;

  @IsInt()
  @Min(1)
  updatedBy: User;

  @IsOptional()
  createdAt: Date;

  @IsOptional()
  updatedAt: Date;
}
