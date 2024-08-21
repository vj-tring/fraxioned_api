import { IsArray, IsNotEmpty } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../../entities/property.entity';
import { CreateImagesDto } from './create-images.dto';

export class CreatePropertyImagesDto {
  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'property ID is required' })
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Property;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;

  @ApiProperty({
    example: [
      {
        name: 'Bedroom 1',
        spaceTypeId: { id: 1 },
      },
      {
        name: 'Bathroom 1',
        spaceTypeId: { id: 2 },
      },
    ],
  })
  @IsArray()
  images: CreateImagesDto[];
}
