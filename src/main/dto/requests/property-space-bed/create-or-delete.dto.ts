import {
  IsNotEmpty,
  IsArray,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { PropertySpace } from 'src/main/entities/property-space.entity';
import { SpaceBedType } from 'src/main/entities/space-bed-type.entity';
import { User } from 'src/main/entities/user.entity';

export class SpaceBedTypeCount {
  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'spaceBedType is required' })
  @IsValidId({
    message: 'spaceBedType must be an object with a valid id (id >= 1)',
  })
  @Type(() => SpaceBedType)
  spaceBedType: SpaceBedType;

  @ApiProperty({ example: 2 })
  @IsNotEmpty({ message: 'count is required' })
  @IsNumber({}, { message: 'count must be a number' })
  @Min(1, { message: 'count must be greater than or equal to 1' })
  count: number;
}

export class CreateOrDeletePropertySpaceBedsDto {
  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'propertySpace is required' })
  @IsValidId({
    message: 'propertySpace must be an object with a valid id (id >= 1)',
  })
  @Type(() => PropertySpace)
  propertySpace: PropertySpace;

  @ApiProperty({ type: [SpaceBedTypeCount] })
  @IsArray({ message: 'spaceBedTypes must be an array' })
  @ValidateNested({ each: true })
  @Type(() => SpaceBedTypeCount)
  spaceBedTypes: SpaceBedTypeCount[];

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'updatedBy is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id (id >= 1)',
  })
  @Type(() => User)
  updatedBy: User;
}
