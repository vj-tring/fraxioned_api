import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { Transform } from 'class-transformer';

export class CreateUserPropertyDocumentDto {
  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'user is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'user must be an object with a valid id where (id >= 1)',
  })
  user: User;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'property is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Property;

  @ApiProperty({ example: 'User Property Document' })
  @IsNotEmpty({ message: 'Document name is required' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Legal' })
  @IsNotEmpty({ message: 'Document type is required' })
  @IsString()
  documentType: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  documentFile: Express.Multer.File;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'created by is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;
}

export class CreateUserPropertyDocumentsRequestDto {
  @IsNotEmpty()
  @IsString()
  userPropertyDocuments: string;
}
