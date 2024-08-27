import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../../../entities/property.entity';
import { SpaceTypes } from 'src/main/entities/space-types.entity';
import { Transform } from 'class-transformer';

export class UpdatePropertyImageDto {
  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'property ID is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Property;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'updated by is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;

  @ApiProperty({ example: 'Bedroom 1' })
  @IsNotEmpty({ message: 'Image name is required' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'Display order is required' })
  @IsNumber()
  @Min(1)
  displayOrder: number;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'Space type ID is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'space type must be an object with a valid id where (id >= 1)',
  })
  spaceType: SpaceTypes;

  @ApiProperty({ type: 'string', format: 'binary' })
  imageFile: Express.Multer.File;
}
