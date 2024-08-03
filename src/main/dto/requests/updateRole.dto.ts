import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { User } from '../../entities/user.entity';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';

export class UpdateRoleDTO {
  @IsString()
  @IsOptional()
  roleName?: string;

  @IsString()
  @IsOptional()
  roleDescription?: string;

  @IsNotEmpty({ message: 'updated by is required' })
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
