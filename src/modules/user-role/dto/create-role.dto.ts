import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateRoleDTO {
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @IsString()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  createdBy: number;
}
