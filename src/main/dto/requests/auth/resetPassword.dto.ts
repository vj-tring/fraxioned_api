import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'oldPassword is required' })
  oldPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'newPassword is required' })
  newPassword: string;

  @IsInt()
  @IsNotEmpty({ message: 'userId is required' })
  userId: number;
}
