import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { AmenityGroup } from 'src/main/entities/amenity-group.entity';
import { Transform } from 'class-transformer';

export class UpdateAmenitiesDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  imageFile?: Express.Multer.File;

  @IsString()
  @IsNotEmpty({ message: 'Amenity name must not be an empty string' })
  @IsOptional()
  amenityName: string;

  @IsOptional()
  @IsString()
  amenityDescription?: string;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsOptional()
  @IsValidId({
    message: 'amenityGroup must be an object with a valid id where (id >= 1)',
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? JSON.parse(value) : value;
  })
  amenityGroup: AmenityGroup;

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
