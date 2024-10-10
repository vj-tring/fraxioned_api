import {
  IsString,
  IsBoolean,
  IsOptional,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'entities/role.entity';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';
import { Type, Transform } from 'class-transformer';
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
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  password?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  imageURL?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  state?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  country?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  city?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  zipcode?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  resetToken?: string;

  @IsOptional()
  resetTokenExpires?: Date;

  @IsOptional()
  lastLoginTime?: Date;

  @IsInt()
  @IsOptional()
  updatedBy?: number;
  
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserContactDetailsDTO)
  contactDetails?: UserContactDetailsDTO;
}``