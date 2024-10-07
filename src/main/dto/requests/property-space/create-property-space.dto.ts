import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Space } from 'src/main/entities/space.entity';
import { Property } from 'src/main/entities/property.entity';

export class CreatePropertySpaceDto {
  @IsNotEmpty({ message: 'instance number is required' })
  @IsNumber()
  @Min(1, { message: 'instance number must be at least 1' })
  instanceNumber: number;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'Space ID is required' })
  @IsValidId({
    message: 'Space must be an object with a valid id where (id >= 1)',
  })
  space: Space;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'Property ID is required' })
  @IsValidId({
    message: 'Property must be an object with a valid id where (id >= 1)',
  })
  property: Property;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id property (id >= 1)',
  })
  createdBy: User;
}
