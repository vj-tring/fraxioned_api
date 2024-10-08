import { IsNotEmpty, IsArray, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { PropertySpace } from 'src/main/entities/property-space.entity';
import { SpaceBedType } from 'src/main/entities/space-bed-type.entity';
import { User } from 'src/main/entities/user.entity';

export class CreateOrDeletePropertySpaceBedsDto {
  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'propertySpace is required' })
  @IsValidId({
    message: 'propertySpace must be an object with a valid id (id >= 1)',
  })
  propertySpace: PropertySpace;

  @IsArray()
  spaceBedTypes: SpaceBedTypeCount[];

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'Updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id (id >= 1)',
  })
  updatedBy: User;
}

export class SpaceBedTypeCount {
  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'spaceBedTypeId is required' })
  @IsValidId({
    message: 'spaceBedTypeId must be an object with a valid id (id >= 1)',
  })
  spaceBedTypeId: SpaceBedType;

  @ApiProperty({ example: 2 })
  @IsNotEmpty({ message: 'count is required' })
  @IsNumber()
  @Min(1, { message: 'count must be greater than or equal to 1' })
  count: number;
}
