import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'oldPassword is required' })
  @ApiProperty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'newPassword is required' })
  @ApiProperty()
  newPassword: string;

  @IsInt()
  @IsNotEmpty({ message: 'userId is required' })
  @ApiProperty()
  userId: number;
}
