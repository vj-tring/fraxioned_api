import { IsString, IsOptional, IsInt, IsNotEmpty, Min } from 'class-validator';
import { User } from '../entities/user.entity';

export class UpdateRoleDTO {
  @IsString()
  @IsOptional()
  roleName?: string;

  @IsString()
  @IsOptional()
  roleDescription?: string;

  @IsNotEmpty({ message: 'updatedBy is required' })
  @IsInt()
  @Min(1)
  updatedBy: User;
}
