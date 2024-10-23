import { IsNotEmpty, IsInt } from 'class-validator';
import { User } from 'entities/user.entity';
import { Property } from 'entities/property.entity';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserPropertyDTO {
  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'user is required' })
  @IsValidId({
    message: 'user must be an object with a valid id where (id >= 1)',
  })
  user: User;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'property is required' })
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Property;

  @IsInt()
  @IsNotEmpty({ message: 'noOfShare is required' })
  noOfShare: number;

  @IsNotEmpty({ message: 'acquisitionDate is required' })
  acquisitionDate: Date;

  @IsNotEmpty({ message: 'acquisitionDate is required' })
  isActive: boolean;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'createdBy is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;
}
