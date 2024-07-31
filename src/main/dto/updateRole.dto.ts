import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateRoleDTO {
  @IsString()
  @IsOptional()
  roleName?: string;

  @IsString()
  @IsOptional()
  roleDescription?: string;

  @IsInt()
  @IsNotEmpty({ message: 'updatedBy is required' })
  updatedBy: number;
}
