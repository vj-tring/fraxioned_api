import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';

export class CreateUserSessionDTO {
  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'user by is required' })
  @IsValidId({
    message: 'user must be an object with a valid id where (id >= 1)',
  })
  user: User;

  @IsString()
  @IsNotEmpty({ message: 'token is required' })
  token: string;

  @IsNotEmpty({ message: 'expiresAt is required' })
  expiresAt: Date;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'createdBy by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;

  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
