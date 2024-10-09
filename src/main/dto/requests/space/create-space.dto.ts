import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSpaceDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  imageFile: Express.Multer.File;

  @IsNotEmpty({ message: 'space name is required' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'The isBedTypeAllowed field is required' })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isBedTypeAllowed: boolean = false;

  @IsNotEmpty({ message: 'The isBathroomTypeAllowed field is required' })
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isBathroomTypeAllowed: boolean = false;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id (id >= 1)',
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? JSON.parse(value) : value;
  })
  createdBy: User;
}
