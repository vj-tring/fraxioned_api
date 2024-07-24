import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateRoleDTO {
  @IsString()
  @IsNotEmpty({message: 'role_name is required'})
  @ApiProperty()
  role_name: string;

  @IsString()
  @ApiProperty()
  description?: string;

  @IsInt()
  @IsNotEmpty({message: 'created_by is required'})
  @ApiProperty()
  created_by: number;
  static created_by: any;
}
