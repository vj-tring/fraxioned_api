import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty({message: 'email is required'})
  email: string;
  @IsNotEmpty({message: 'password is required'})
  @ApiProperty()
  password: string;
}
