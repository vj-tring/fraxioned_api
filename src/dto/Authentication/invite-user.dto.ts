import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty()
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
  city: string;

  @ApiProperty()
  zip: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  roleId: number;
  
  @ApiProperty()
  updated_by: number;
  
  @ApiProperty()
  created_by: number;
}
