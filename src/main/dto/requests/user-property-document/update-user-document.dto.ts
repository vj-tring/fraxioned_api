import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { User } from 'src/main/entities/user.entity';
import { Property } from 'src/main/entities/property.entity';
import { Transform } from 'class-transformer';

export class UpdateUserPropertyDocumentDto {
  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'user must be an object with a valid id where (id >= 1)',
  })
  user?: User;

  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  property?: Property;

  @ApiProperty({ example: 'Updated User Property Document' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Legal' })
  @IsOptional()
  @IsString()
  documentType?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  documentFile?: Express.Multer.File;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'updated by is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
export class UpdateUserPropertyDocumentRequestDto {
  @IsNotEmpty()
  @IsString()
  userPropertyDocument: string;
}
