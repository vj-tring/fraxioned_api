import { IsNotEmpty, IsString } from 'class-validator';

export class UserContactDetailsDTO {
  @IsString()
  @IsNotEmpty({ message: 'contactType is required' })
  contactType: string;

  @IsString()
  @IsNotEmpty({ message: 'contactValue is required' })
  contactValue: string;
}
