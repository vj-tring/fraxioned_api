import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateRoleDTO {
  @IsString()
  @IsNotEmpty({ message: 'role_name is required' })
  roleName: string;

  @IsString()
  @IsOptional()
  roleDescription?: string;

  @IsInt()
  @IsNotEmpty({ message: 'created_by is required' })
  createdBy: number;
}
