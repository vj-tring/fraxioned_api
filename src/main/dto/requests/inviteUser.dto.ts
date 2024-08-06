import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserPropertyDto } from './userProperty.dto';

export class InviteUserDto {
  @IsNotEmpty({ message: 'email is required' })
  email: string;

  @IsNotEmpty({ message: 'firstName is required' })
  firstName: string;

  @IsNotEmpty({ message: 'firstName is required' })
  lastName: string;

  @IsNotEmpty({ message: 'addressLine1 is required' })
  addressLine1: string;

  @IsOptional()
  addressLine2: string;

  @IsNotEmpty({ message: 'state is required' })
  state: string;

  @IsNotEmpty({ message: 'country is required' })
  country: string;

  @IsNotEmpty({ message: 'city is required' })
  city: string;

  @IsNotEmpty({ message: 'zipcode is required' })
  zipcode: string;

  @IsNotEmpty({ message: 'phoneNumber is required' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'roleID is required' })
  roleId: number;

  @IsNotEmpty({ message: 'updated_by is required' })
  updatedBy: number;

  @IsNotEmpty({ message: 'created_by is required' })
  createdBy: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserPropertyDto)
  userPropertyDetails: UserPropertyDto;
}
