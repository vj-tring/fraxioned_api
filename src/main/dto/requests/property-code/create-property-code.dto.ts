import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { PropertyCodeCategory } from 'src/main/entities/property-code-category.entity';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';

export class CreatePropertyCodeDto {
  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'property ID is required' })
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Property;

  @ApiProperty({
    example: { id: 1, name: 'Door' },
  })
  @IsNotEmpty({ message: 'property code category ID and name is required' })
  @IsValidId({
    message:
      'property code category must be an object with a valid id where (id >= 1)',
  })
  propertyCodeCategory: PropertyCodeCategory;

  @IsNotEmpty({ message: 'Property code value is required' })
  @IsString()
  propertyCode: string;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;
}
