import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

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
  city: string;

  @ApiProperty()
  zip: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'phoneNumber is required' })
  phoneNumber: string;

  @ApiProperty()
  roleId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'updated_by is required' })
  updated_by: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'created_by is required' })
  created_by: number;
}
