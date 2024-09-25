import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'commons/guards/is-valid-id.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHouseCodeCategoryDto {
  @IsNotEmpty({ message: 'house code name is required' })
  @IsString()
  name: string;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsNotEmpty({ message: 'created by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id (id >= 1)',
  })
  createdBy: User;
}
