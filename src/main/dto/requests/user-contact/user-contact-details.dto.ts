import { IsInt, IsOptional, IsString } from 'class-validator';

export class UserContactDetailsDTO {
  @IsInt()
  @IsOptional()
  id: number;

  @IsString()
  @IsOptional()
  primaryEmail: string;

  @IsString()
  @IsOptional()
  primaryPhone: string;

  @IsString()
  @IsOptional()
  secondaryEmail: string;

  @IsString()
  @IsOptional()
  secondaryPhone: string;

  @IsString()
  @IsOptional()
  optionalEmailOne: string;

  @IsString()
  @IsOptional()
  optionalPhoneOne: string;

  @IsString()
  @IsOptional()
  optionalEmailTwo: string;

  @IsString()
  @IsOptional()
  optionalPhoneTwo: string;
}
