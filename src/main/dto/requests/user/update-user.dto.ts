import {
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

export class UpdateUserDTO {
  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @IsValidId({
    message: 'role must be an object with a valid id where (id >= 1)',
  })
  role?: Role;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  imageURL?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

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
  @IsOptional()
  updatedBy?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserContactDetailsDTO)
  contactDetails?: UserContactDetailsDTO[];
}
