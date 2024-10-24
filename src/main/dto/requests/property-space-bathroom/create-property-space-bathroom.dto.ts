import { IsNotEmpty, IsNumber } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { SpaceBathroomTypes } from 'src/main/entities/space-bathroom-types.entity';
import { PropertySpace } from 'src/main/entities/property-space.entity';

export class CreatePropertySpaceBathroomDto {
  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'space bathroom type is required' })
  @IsValidId({
    message: 'space bathroom type must be an object with a valid id (id >= 1)',
  })
  spaceBathroomType: SpaceBathroomTypes;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'space instance is required' })
  @IsValidId({
    message: 'space instance must be an object with a valid id (id >= 1)',
  })
  propertySpace: PropertySpace;

  @IsNotEmpty({ message: 'count is required' })
  @IsNumber()
  count: number;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id (id >= 1)',
  })
  createdBy: User;
}
