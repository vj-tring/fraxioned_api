import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserContactDetailsDTO {
  @IsInt()
  @IsOptional()
  id: number;

  @IsString()
  @IsNotEmpty({ message: 'contactType is required' })
  contactType: string;

  @IsString()
  @IsNotEmpty({ message: 'contactValue is required' })
  contactValue: string;
}
