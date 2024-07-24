import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateRoleDTO {
  @IsString()
  @IsOptional()
  @ApiProperty()
  role_name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  updated_by: number;
}
