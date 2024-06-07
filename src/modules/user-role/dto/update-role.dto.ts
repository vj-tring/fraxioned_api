import { IsString, IsOptional } from 'class-validator';

export class UpdateRoleDTO {
  @IsString()
  @IsOptional()
  roleName?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
