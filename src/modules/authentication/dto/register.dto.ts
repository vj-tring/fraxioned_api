import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RegisterDTO {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  secondaryPhone: string;

  @ApiProperty()
  secondaryEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  address1: string;

  @ApiProperty()
  address2: string;

  @ApiProperty()
  state: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  zip: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  inviteToken: string;
   
}
