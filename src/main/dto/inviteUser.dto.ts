import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserPropertyDto } from './userProperty.dto';

export class InviteUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  addressLine1: string;

  @ApiProperty()
  addressLine2: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  zipcode: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'roleID is required' })
  roleId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'updated_by is required' })
  updated_by: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'created_by is required' })
  created_by: number;

  @ApiProperty({ type: UserPropertyDto })
  @ValidateNested()
  @Type(() => UserPropertyDto)
  userPropertyDetails: UserPropertyDto;
}
