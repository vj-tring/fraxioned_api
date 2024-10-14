import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSpaceBedTypeDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  imageFile: Express.Multer.File;

  @IsNotEmpty({ message: 'Bed type is required' })
  @IsString()
  bedType: string;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'Created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id (id >= 1)',
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? JSON.parse(value) : value;
  })
  createdBy: User;
}
