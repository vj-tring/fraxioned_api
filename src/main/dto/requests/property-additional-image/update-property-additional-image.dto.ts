import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Property } from 'src/main/entities/property.entity';

export class UpdatePropertyAdditionalImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  imageFile?: Express.Multer.File;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'Display order is required' })
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  displayOrder: number;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'Property ID is required' })
  @IsValidId({
    message: 'property must be an object with a valid id where (id >= 1)',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  property?: Property;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? JSON.parse(value) : value;
  })
  updatedBy: User;
}
