import { IsOptional } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateSpaceBedTypeDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  imageFile?: Express.Multer.File;

  @IsOptional()
  bedType: string;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  @Transform(({ value }) => {
    return typeof value === 'string' ? JSON.parse(value) : value;
  })
  updatedBy: User;
}
