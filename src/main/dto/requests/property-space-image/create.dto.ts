import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
} from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PropertySpace } from 'src/main/entities/property-space.entity';

export class CreatePropertySpaceImageDto {
  @ApiProperty({ example: 'Living Room Image' })
  @IsNotEmpty({ message: 'Image name is required' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty({ message: 'Display order is required' })
  @IsNumber()
  @Min(1)
  displayOrder: number;

  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'propertySpace must be an object with a valid id where (id >= 1)',
  })
  propertySpace?: PropertySpace;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'Created by is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;

  @ApiProperty({ type: 'string', format: 'binary' })
  imageFile: Express.Multer.File;
}
