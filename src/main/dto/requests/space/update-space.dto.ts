import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateSpaceDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  imageFile?: Express.Multer.File;

  @IsString()
  @IsNotEmpty({ message: 'space name is required' })
  @IsOptional()
  name: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'The isBedTypeAllowed field is required' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isBedTypeAllowed: boolean;

  @IsBoolean()
  @IsNotEmpty({ message: 'The isBathroomTypeAllowed field is required' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isBathroomTypeAllowed: boolean;

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
