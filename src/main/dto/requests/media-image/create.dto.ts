import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Property } from 'src/main/entities/property.entity';
import { Amenities } from 'src/main/entities/amenities.entity';
import { PropertySpace } from 'src/main/entities/property-space.entity';
import { SpaceBathroomTypes } from 'src/main/entities/space-bathroom-types.entity';
import { SpaceBedType } from 'src/main/entities/space-bed-type.entity';
import { Space } from 'src/main/entities/space.entity';

export class CreateMediaImageDto {
  @ApiProperty({ example: 'Living Room Image' })
  @IsNotEmpty({ message: 'Image name is required' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'Display order is required' })
  @IsNumber()
  @Min(1)
  displayOrder: number;

  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'amenities must be an object with a valid id where (id >= 1)',
  })
  amenities?: Amenities;

  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property?: Property;

  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'propertySpace must be an object with a valid id where (id >= 1)',
  })
  propertySpace?: PropertySpace;

  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message:
      'spaceBathroomType must be an object with a valid id where (id >= 1)',
  })
  spaceBathroomType?: SpaceBathroomTypes;

  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'spaceBedType must be an object with a valid id where (id >= 1)',
  })
  spaceBedType?: SpaceBedType;

  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'space must be an object with a valid id where (id >= 1)',
  })
  space?: Space;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'User is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'user must be an object with a valid id where (id >= 1)',
  })
  user: User;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  mailBanner?: boolean;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  coverPicture?: boolean;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'Created by is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;

  @ApiProperty({ type: 'string', format: 'binary' })
  imageFile: Express.Multer.File;
}
