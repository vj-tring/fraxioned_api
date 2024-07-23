import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateRoleDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  roleName: string;

  @IsString()
  @ApiProperty()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  createdBy: number;
}
