import { IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
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

  @ApiProperty({ type: [SpaceBedType] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpaceBedType)
  spaceBedTypes: SpaceBedType[];

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'Updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id (id >= 1)',
  })
  updatedBy: User;
}
