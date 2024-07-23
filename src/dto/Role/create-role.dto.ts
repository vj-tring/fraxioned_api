import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateRoleDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  role_name: string;

  @IsString()
  @ApiProperty()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  created_by: number;
}
