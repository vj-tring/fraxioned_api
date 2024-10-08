import { IsNotEmpty, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { PropertySpace } from 'src/main/entities/property-space.entity';
import { User } from 'src/main/entities/user.entity';
import { SpaceBathroomTypes } from 'src/main/entities/space-bathroom-types.entity';

export class CreateOrDeletePropertySpaceBathroomsDto {
  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'propertySpace is required' })
  @IsValidId({
    message: 'propertySpace must be an object with a valid id (id >= 1)',
  })
  propertySpace: PropertySpace;

  @IsArray()
  spaceBathroomTypes: SpaceBathroomTypesCount[];

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'Updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id (id >= 1)',
  })
  updatedBy: User;
}

export class SpaceBathroomTypesCount {
  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'space bathroom type is required' })
  @IsValidId({
    message: 'space bathroom type must be an object with a valid id (id >= 1)',
  })
  spaceBathroomType: SpaceBathroomTypes;

  @IsNotEmpty({ message: 'count is required' })
  @IsNumber()
  count: number;
}
