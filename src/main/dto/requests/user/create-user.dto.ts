import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'entities/role.entity';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { Type } from 'class-transformer';
import { UserContactDetailsDTO } from '../user-contact/user-contact-details.dto';

export class CreateUserDTO {
  @ApiProperty({ example: { id: 1 } })
  @IsNotEmpty({ message: 'role is required' })
  @IsValidId({
    message: 'role must be an object with a valid id where (id >= 1)',
  })
  role: Role;

  @IsString()
  @IsNotEmpty({ message: 'firstName is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'lastName is required' })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  password: string;

  @IsOptional()
  @IsString()
  imageURL?: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'isActive is required' })
  isActive: boolean;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  zipcode?: string;

  @IsOptional()
  @IsString()
  resetToken?: string;

  @IsOptional()
  resetTokenExpires?: Date;

  @IsOptional()
  lastLoginTime?: Date;

  @IsInt()
  createdBy?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserContactDetailsDTO)
  contactDetails: UserContactDetailsDTO[];
}
