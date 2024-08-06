import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAmenitiesDto {
  @IsNotEmpty({ message: 'amenity name is required' })
  @IsString()
  amenityName: string;

  @IsOptional()
  @IsString()
  amenityDescription: string;

  @IsNotEmpty({ message: 'amenity type is required' })
  @IsString()
  amenityType: string;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id property (id >= 1)',
  })
  createdBy: User;
}
