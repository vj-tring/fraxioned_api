import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { PropertySpace } from 'src/main/entities/property-space.entity';
import { SpaceBedType } from 'src/main/entities/space-bed-type.entity';
import { User } from 'src/main/entities/user.entity';

export class CreatePropertySpaceBedDto {
  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'propertySpace is required' })
  @IsValidId({
    message: 'propertySpace must be an object with a valid id (id >= 1)',
  })
  propertySpace: PropertySpace;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'spaceBedType is required' })
  @IsValidId({
    message: 'spaceBedType must be an object with a valid id (id >= 1)',
  })
  spaceBedType: SpaceBedType;

  @IsNotEmpty()
  count: number;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'Created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id (id >= 1)',
  })
  createdBy: User;
}
