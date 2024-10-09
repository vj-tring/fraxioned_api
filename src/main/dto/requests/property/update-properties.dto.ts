import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
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
  @Transform(({ value }) => value?.trim())
  propertyName: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  ownerRezPropId: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  address: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  city: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  state: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  country: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  zipcode: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  houseDescription: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isExclusive: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  propertyShare: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive: boolean;

  @IsOptional()
  @IsInt({ message: 'displayOrder should be int' })
  @Type(() => Number)
  displayOrder: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  mailBannerUrl: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  coverImageUrl: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  mailBannerFile?: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  coverImageFile?: Express.Multer.File;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'updatedBy is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id (id >= 1)',
  })
  @Type(() => User)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  updatedBy: User;
}
