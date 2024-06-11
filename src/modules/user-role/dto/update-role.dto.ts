import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateRoleDTO {
  @IsString()
  @IsOptional()
  @ApiProperty()
  roleName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  description?: string;
}
