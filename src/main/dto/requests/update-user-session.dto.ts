import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { User } from 'src/main/entities/user.entity';

export class UpdateUserSessionDTO {
  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  expiresAt?: Date;

  @IsNotEmpty({ message: 'updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
