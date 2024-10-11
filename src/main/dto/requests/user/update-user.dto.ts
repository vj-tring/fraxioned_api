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
import { plainToClass, Transform, Type } from 'class-transformer';
import { UserContactDetailsDTO } from '../user-contact/user-contact-details.dto';

export class UpdateUserDTO {
  @ApiProperty({ example: { id: 1 } })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
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
  @Transform(({ value }) => value === 'true' || value === true)
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
  @Transform(({ value }) => new Date(value))
  resetTokenExpires?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  lastLoginTime?: Date;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  updatedBy?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsedValue = JSON.parse(value);
        return plainToClass(UserContactDetailsDTO, parsedValue);
      } catch (error) {
        throw new Error('Invalid JSON string for contactDetails');
      }
    }
    return plainToClass(UserContactDetailsDTO, value);
  })
  @Type(() => UserContactDetailsDTO)
  contactDetails?: UserContactDetailsDTO;
  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  profileImage?: Express.Multer.File;
}
