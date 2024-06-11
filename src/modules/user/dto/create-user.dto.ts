import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
  @ApiProperty()
  username: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  secondaryPhone: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  secondaryEmail: string;

  @ApiProperty()
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
  password: string;
}
