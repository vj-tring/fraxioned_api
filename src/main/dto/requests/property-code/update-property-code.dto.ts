import { IsString, IsNotEmpty } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from 'src/main/entities/property.entity';
import { PropertyCodeCategory } from 'src/main/entities/property-code-category.entity';

export class UpdatePropertyCodeDto {
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
  @IsNotEmpty({ message: 'updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
