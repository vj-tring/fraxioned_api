import { IsOptional, IsInt, IsNotEmpty } from 'class-validator';
import { User } from 'entities/user.entity';
import { Property } from 'entities/property.entity';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPropertyDTO {
  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @IsValidId({
    message: 'user must be an object with a valid id where (id >= 1)',
  })
  user?: User;

  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property?: Property;

  @IsInt()
  @IsOptional()
  noOfShare?: number;

  @IsOptional()
  acquisitionDate?: Date;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'updatedBy is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
