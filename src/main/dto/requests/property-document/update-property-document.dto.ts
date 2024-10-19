import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Property } from '../../../entities/property.entity';
import { Transform } from 'class-transformer';

export class UpdatePropertyDocumentDto {
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
  @IsNotEmpty({ message: 'updated by is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;

  @ApiProperty({ example: 'Updated Property Deed' })
  @IsNotEmpty({ message: 'Document name is required' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Legal' })
  @IsNotEmpty({ message: 'Document type is required' })
  @IsString()
  documentType: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  documentFile: Express.Multer.File;
}
