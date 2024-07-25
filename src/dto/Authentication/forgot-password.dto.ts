import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;
}
