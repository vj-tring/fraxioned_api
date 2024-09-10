import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { User } from 'entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Space } from 'src/main/entities/space.entity';

export class CreateSpaceTypeDto {
  @IsNotEmpty({ message: 'space type name is required' })
  @IsString()
  name: string;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'Space ID is required' })
  @IsValidId({
    message: 'space must be an object with a valid id where (id >= 1)',
  })
  space: Space;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;
}
