import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSpaceBedTypeDto {
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
  createdBy: User;
}
