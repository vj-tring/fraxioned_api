import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class UpdateRoleDTO {
  @IsString()
  @IsOptional()
  @ApiProperty()
  roleName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  roleDescription?: string;

  @IsInt()
  @IsNotEmpty({ message: 'updatedBy is required' })
  @ApiProperty()
  updatedBy: number;
}
