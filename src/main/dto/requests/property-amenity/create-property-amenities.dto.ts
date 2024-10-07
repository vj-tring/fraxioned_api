import { IsNotEmpty, IsOptional } from 'class-validator';
import { Property } from 'entities/property.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { User } from 'entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Amenities } from 'src/main/entities/amenities.entity';
import { PropertySpace } from 'src/main/entities/property-space.entity';

export class CreatePropertyAmenitiesDto {
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
  @IsOptional()
  @IsValidId({
    message: 'PropertySpace must be an object with a valid id where (id >= 1)',
  })
  propertySpace: PropertySpace;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'amenity ID is required' })
  @IsValidId({
    message: 'amenity must be an object with a valid id where (id >= 1)',
  })
  amenity: Amenities;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;
}
