// DTOs
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../../../entities/property.entity';
import { Transform } from 'class-transformer';

export class CreatePropertyDocumentsDto {
  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'property ID is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property: Property;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;

  @ApiProperty({ example: 'Property Deed' })
  @IsNotEmpty({ message: 'Document name is required' })
  @IsString()
  documentName: string;

  @ApiProperty({ example: 'Legal' })
  @IsNotEmpty({ message: 'Document type is required' })
  @IsString()
  documentType: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  documentFile: Express.Multer.File;
}
