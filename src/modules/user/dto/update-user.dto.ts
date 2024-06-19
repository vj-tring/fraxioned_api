import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDTO } from './create-user.dto';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

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
