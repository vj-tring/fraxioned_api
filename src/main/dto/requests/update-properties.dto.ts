import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { User } from 'src/main/entities/user.entity';

export class UpdatePropertiesDto {
  @IsOptional()
  @IsString()
  propertyName: string;

  @IsInt()
  ownerRezPropId: number;

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
  latitude: number;

  @IsOptional()
  longitude: number;

  @IsOptional()
  isActive: boolean;

  @IsOptional()
  @IsInt({ message: 'displayOrder should be int' })
  displayOrder: number;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
