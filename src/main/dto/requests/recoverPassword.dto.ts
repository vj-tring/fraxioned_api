import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Password should not be empty' })
  newPassword: string;
}
