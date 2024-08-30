import { ApiProperty } from '@nestjs/swagger';
import { User } from 'aws-sdk/clients/appstream';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsValidId } from 'src/main/commons/guards/is-valid-id.decorator';

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

  @ApiProperty({
    example: { id: 1 },
  })
  @IsOptional()
  @IsValidId({
    message: 'createdBy must be an object with a valid id where (id >= 1)',
  })
  createdBy: User;

  @ApiProperty({
    example: { id: 1 },
  })
  @IsOptional()
  @IsValidId({
    message: 'updatedBy must be an object with a valid id where (id >= 1)',
  })
  updatedBy: User;
}
