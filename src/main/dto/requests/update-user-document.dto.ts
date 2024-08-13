import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { Property } from 'src/main/entities/property.entity';
import { User } from 'src/main/entities/user.entity';

export class UpdateUserDocumentDTO {
  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @IsValidId({
    message: 'user must be an object with a valid id where (id >= 1)',
  })
  user: User;

  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Property;

  @IsOptional()
  @IsString()
  documentName?: string;

  @IsOptional()
  @IsString()
  documentURL?: string;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'updatedBy is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
