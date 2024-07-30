import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';
import { Users } from 'src/entities/users.entity';

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

  @IsString()
  mapCoordinates: string = 'POINT (0 0)';

  @IsInt()
  @Min(1)
  createdBy: Users;

  @IsInt()
  @Min(1)
  updatedBy: Users;

  createdAt: Date;

  updatedAt: Date;
}
