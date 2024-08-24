import { IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;
}
