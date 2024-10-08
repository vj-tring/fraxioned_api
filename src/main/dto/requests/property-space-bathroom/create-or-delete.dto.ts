import {
  IsNotEmpty,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { PropertySpace } from 'src/main/entities/property-space.entity';
import { User } from 'src/main/entities/user.entity';
import { SpaceBathroomTypes } from 'src/main/entities/space-bathroom-types.entity';
import { Type } from 'class-transformer';

export class SpaceBathroomTypesCount {
  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'space bathroom type is required' })
  @IsValidId({
    message: 'space bathroom type must be an object with a valid id (id >= 1)',
  })
  spaceBathroomType: SpaceBathroomTypes;

  @ApiProperty({ example: 2 })
  @IsNotEmpty({ message: 'count is required' })
  @IsNumber({}, { message: 'count must be a number' })
  @Min(1, { message: 'count must be greater than or equal to 1' })
  count: number;
}

export class CreateOrDeletePropertySpaceBathroomsDto {
  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'propertySpace is required' })
  @IsValidId({
    message: 'propertySpace must be an object with a valid id (id >= 1)',
  })
  propertySpace: PropertySpace;

  @ApiProperty({ type: [SpaceBathroomTypesCount] })
  @IsArray({ message: 'spaceBathroomTypes must be an array' })
  @ValidateNested({ each: true })
  @Type(() => SpaceBathroomTypesCount)
  spaceBathroomTypes: SpaceBathroomTypesCount[];

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'Updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id (id >= 1)',
  })
  updatedBy: User;
}
