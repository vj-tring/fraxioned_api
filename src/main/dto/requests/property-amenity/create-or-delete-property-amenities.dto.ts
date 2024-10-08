import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { IsValidIdArray } from 'src/main/commons/guards/is-valid-id-list.decorator';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { Amenities } from 'src/main/entities/amenities.entity';
import { PropertySpace } from 'src/main/entities/property-space.entity';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';

export class CreateOrDeletePropertyAmenitiesDto {
  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'property ID is required' })
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Property;

  @ApiProperty({
    example: { id: null },
  })
  @IsNotEmpty({ message: 'property space is required' })
  propertySpace?: PropertySpace;

  @ApiProperty({
    example: [{ id: 1 }, { id: 2 }],
  })
  @IsValidIdArray({
    message: 'Each amenity in the array must have a valid id (id >= 1)',
  })
  amenities: Amenities[];

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'updatedBy is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
