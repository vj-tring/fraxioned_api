import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { User } from 'entities/user.entity';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';

export class CreateRoleDTO {
  @IsString()
  @IsNotEmpty({ message: 'role_name is required' })
  roleName: string;

  @IsString()
  @IsOptional()
  roleDescription?: string;

  @IsNotEmpty({ message: 'createdBy by is required' })
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;
}
