import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateRoleDTO {
  @IsString()
  @IsNotEmpty({ message: 'role_name is required' })
  @ApiProperty()
  roleName: string;

  @IsString()
  @ApiProperty()
  description?: string;

  @IsInt()
  @IsNotEmpty({ message: 'created_by is required' })
  @ApiProperty()
  createdBy: number;
}
