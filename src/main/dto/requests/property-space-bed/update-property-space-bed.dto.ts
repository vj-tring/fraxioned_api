import { IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { PropertySpace } from 'src/main/entities/property-space.entity';
import { SpaceBedType } from 'src/main/entities/space-bed-type.entity';
import { User } from 'src/main/entities/user.entity';

export class UpdatePropertySpaceBedDto {
  @ApiProperty({
    example: { id: 1 },
  })
  @IsOptional()
  @IsValidId({
    message: 'propertySpace must be an object with a valid id (id >= 1)',
  })
  propertySpace?: PropertySpace;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsOptional()
  @IsValidId({
    message: 'spaceBedType must be an object with a valid id (id >= 1)',
  })
  spaceBedType?: SpaceBedType;

  @IsOptional()
  @IsNumber()
  count?: number;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'Updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
