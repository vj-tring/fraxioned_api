import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';
import { User } from '../entities/user.entity';

export class CreateRoleDTO {
  @IsString()
  @IsNotEmpty({ message: 'role_name is required' })
  roleName: string;

  @IsString()
  @IsOptional()
  roleDescription?: string;

  @IsNotEmpty({ message: 'created by is required' })
  @IsInt()
  @Min(1)
  createdBy: User;
}
