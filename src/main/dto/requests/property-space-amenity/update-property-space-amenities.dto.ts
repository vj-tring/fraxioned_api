import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { Amenities } from 'src/main/entities/amenities.entity';
import { PropertySpace } from 'src/main/entities/property-space.entity';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';

export class UpdatePropertySpaceAmenitiesDto {
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
  @IsNotEmpty({ message: 'updatedBy is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
