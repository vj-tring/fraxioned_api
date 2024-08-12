import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';

export class CreateUserDocumentDTO {
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

  @IsString()
  @IsNotEmpty({ message: 'documentName is required' })
  documentName: string;

  @IsString()
  @IsNotEmpty({ message: 'documentURL is required' })
  documentURL: string;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'createdBy is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;
}
